from flask import Flask, Response, jsonify, request
import gevent

import re
import gevent.monkey
import json
from waitress import serve
import logging

logger = logging.getLogger("waitress")
logger.setLevel(logging.INFO)

gevent.monkey.patch_all()
# import gevent.queue

import configparser
import pyttsx3
import sys
import os

import queue
import sys
import sounddevice as sd

import fasttext

from deep_translator import (
    MyMemoryTranslator,
)

from vosk import Model, KaldiRecognizer, SetLogLevel

# global variables

SetLogLevel(-1)

settings = configparser.ConfigParser()
app = Flask(__name__)

if len(sys.argv) > 1:
    settingsPath = os.path.normpath(sys.argv[1])
    environment = sys.argv[2]

q = queue.Queue()

# gobal functions


# classes
class LanguageDetection:
    def __init__(self):
        if environment == "dev":
            settings_folder = os.path.dirname(settingsPath)
            src_folder = os.path.dirname(settings_folder)
            main_folder = os.path.dirname(src_folder)
            language_detection_model = os.path.join(
                main_folder, "language_detection_model", f"lid.176.bin"
            )
        else:
            resources_folder = os.path.dirname(settingsPath)
            language_detection_model = os.path.join(
                resources_folder, "language_detection_model", f"lid.176.bin"
            )

        language_detection_model = rf"{language_detection_model}"
        self.model = fasttext.load_model(language_detection_model)

    def predict_lang(self, text):
        predictions = self.model.predict(text, k=3)  # returns top 2 matching languages
        language_codes = []
        for prediction in predictions[0]:
            language_codes.append(prediction.replace("__label__", ""))

        return language_codes


class STT:
    samplerate = None
    args = ""
    remaining = ""

    def __init__(self):
        settings.read(settingsPath)
        device_info = sd.query_devices(int(settings["STT"]["MICROPHONE"]), "input")
        self.samplerate = int(device_info["default_samplerate"])

        if environment == "dev":
            settings_folder = os.path.dirname(settingsPath)
            src_folder = os.path.dirname(settings_folder)
            main_folder = os.path.dirname(src_folder)
            vosk_model = os.path.join(
                main_folder, "speech_to_text_models", settings["STT"]["LANGUAGE"]
            )
        else:
            resources_folder = os.path.dirname(settingsPath)
            vosk_model = os.path.join(
                resources_folder, "speech_to_text_models", settings["STT"]["LANGUAGE"]
            )

        self.model = Model(rf"{vosk_model}")
        self.dump_fn = None

        self.q = gevent.queue.Queue()
        self.rec = None
        self.is_running = False

    def callback(self, indata, frames, time, status):
        if status:
            print(status, file=sys.stderr)
        self.q.put(bytes(indata))

    def start_recognition(self):
        self.is_running = True

        with sd.RawInputStream(
            samplerate=self.samplerate,
            blocksize=8000,
            device=0,  # Default microphone
            dtype="int16",
            channels=1,
            callback=self.callback,
        ):
            self.rec = KaldiRecognizer(self.model, self.samplerate)
            while True:
                data = self.q.get()
                if self.rec.AcceptWaveform(data):
                    result = self.rec.Result()
                    result_json = json.loads(str(result))
                    yield f"data: {result_json}\n\n"
                else:
                    partialResult = self.rec.PartialResult()
                    result_json = json.loads(str(partialResult))
                    yield f"data: {result_json}\n\n"

    def stop_recognition(self):
        self.is_running = False

settings.read(settingsPath)
if settings["STT"]["USE_STT"] and bool(settings["STT"]["LANGUAGE"]):
  speech_recognition_service = STT()


class TTS:
    engine = None
    rate = None

    def __init__(self):
        self.engine = pyttsx3.init()

    def say(self, message, voice, count):
        voices = self.engine.getProperty("voices")
        for item in voices:
            if item.name == voice:
                matching_id = item.id
                break
        self.engine.setProperty("voice", matching_id)

        settings_folder = os.path.dirname(settingsPath)
        if environment == "dev":
            src_folder = os.path.dirname(settings_folder)
            bot_folder = os.path.dirname(src_folder)
            saveLocation = os.path.join(
                bot_folder, "sounds", f"Internal_{count}.mp3"
            )
        else:
            saveLocation = os.path.join(
                settings_folder, "sounds", f"Internal_{count}.mp3"
            )

        self.engine.save_to_file(message, saveLocation)
        self.engine.runAndWait()

    def voices(self):
        voices = self.engine.getProperty("voices")
        self.engine.say(
            ""
        )  # engine breaks if you do not say something after getting voices
        self.engine.runAndWait()

        return [voice.name for voice in voices]

settings.read(settingsPath)
if settings["TTS"]["USE_TTS"]:
  text_to_speech_service = TTS()

# endpoints


@app.route("/stream", methods=["GET"])
def stream_recognition():
    def generate():
        return speech_recognition_service.start_recognition()

    return Response(generate(), content_type="text/event-stream")


@app.route("/stop", methods=["POST"])
def stop_recording():
    speech_recognition_service.stop_recognition()
    return Response("Speech recognition stopped", status=200)


@app.route("/terminate", methods=["GET"])
def terminate_processes():
    shutdown_server()
    os._exit(0)


def shutdown_server():
    func = request.environ.get("sever shutdown")
    if func is None:
        raise RuntimeError("Server is not running")
    func()


@app.route("/status", methods=["GET"])
def server_status():
    return jsonify({"status": "server is running"})


@app.route("/detect", methods=["POST"])
def get_language():
    try:
        request_data = request.json
        message = request_data.get("message", "")
        lang = LanguageDetection().predict_lang(message)
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    return jsonify({"languages": lang}), 200


@app.route("/translate", methods=["POST"])
def get_translation():
    try:
        settings.read(settingsPath)
        request_data = request.json
        message = request_data.get("message", "")
        detectedLanguage = request_data.get("language", "")
        try:
          translated = MyMemoryTranslator(
              source=detectedLanguage, target=settings["LANGUAGE"]["TRANSLATE_TO"]
          ).translate(message)
        except Exception as e:
          return jsonify({"error": str(e), "code":429 }), 429
    except Exception as e:
        return jsonify({"error": str(e), "code":500 }), 500
    return jsonify({"translation": translated}), 200


@app.route("/audio", methods=["POST"])
def trigger_backend_event():
    try:
        request_data = request.json
        message = request_data.get("message", "")
        filteredMessage = re.sub(
            r"https?://(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)",
            "a link",
            message,
        )
        voice = request_data.get("voice")
        count = request_data.get("count")
        text_to_speech_service.say(filteredMessage, voice, count)
    except Exception as e:
        return jsonify({"error": e}), 500
    return jsonify({"message": "Audio triggered"}), 200


@app.route("/voices", methods=["GET"])
def get_voices():
    try:
        voices = text_to_speech_service.voices()
        return jsonify({"voices": voices}), 200
    except Exception as e:
        return jsonify({"error": e}), 500


if __name__ == "__main__":
    if len(sys.argv) > 1:
        settings.read(settingsPath)
        port = int(settings["GENERAL"]["PORT"])
    else:
        environment = "dev"
        port = 9000
        stream_recognition()

    serve(app, host="0.0.0.0", port=port)
