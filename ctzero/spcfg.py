from cantools import config

LANG = {
    "english": "en-US",
    "mandarin": "zh-guoyu"
}
CMDS = {
    "trans": {
        "argos": 'argos-translate --from %s --to %s "%s"',
        "gcloud": 'gcloud alpha ml translate translate-text --source-language=%s --target-language=%s --content="%s"'
    },
    "say": [ # polly - kokoro uses ctutil ai vox
        'aws polly synthesize-speech --output-format mp3 --voice-id %s --text "%s" %s.mp3',
        'aws polly synthesize-speech --output-format json --voice-id %s --text "%s" --speech-mark-types=\'["viseme"]\' %s.json'
    ],
    "rec": {
        "transcode": config.ctzero.asr.audlib + " -i %s.webm -ac 1 %s.wav", # stampath, stampath
        "interpret": {
            "vosk": "vosk-transcriber -i %s.wav -o %s.txt",
            "gcloud": "gcloud ml speech recognize %s.wav --language-code=%s", # stampath, lang
            "baidu": 'wget --header="Content-Type: audio/wav;rate=16000" --post-file=%s.wav "http://vop.baidu.com/server_api?lan=%s&cuid=10569015&token=%s" -O %s.json' # stampath, lang, token, stampath
        }
    },
    "baidu_token": 'wget "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=%s&client_secret=%s&" -O baidu.token' # id, secret
}
AIZ = {
    "aiio": {
        "host": "ai.fzn.party",
        "path": "_respond",
        "proto": "https"
    },
    "pandorabots": {
        "host": "aiaas.pandorabots.com"
    }
}
BAIDU_TOKEN_LIFE = 2592000