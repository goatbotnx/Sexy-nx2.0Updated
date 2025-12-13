module.exports = {
  config: {
    name: "emojivoice",
    version: "3.0",
    author: "xalman",
    countDown: 3,
    role: 0,
    shortDescription: "emoji → funny audio",
    category: "fun",
    longDescription: "no prefix emoji reaction with audio",

    guide: {
      en:
`💬 *How to use emojiAudio*
Just send any supported emoji in chat and bot will reply with funny audio.

🎧 *Supported Emojis Example:*
😆😂😠😵‍💫😁😸🖕🥱🤡😌🥺🤭😅😏😞🤫🍼🤔🥰🤦😘😑😢🙊🤨😡🙈😾😍😭😱😻😿😓💔🥹😩🫣🐸

✔ No prefix needed
✔ Works automatically when emoji is sent`
    }
  },

  onStart: async () => {},

  onChat: async function ({ event, message }) {
    if (!event.body) return;
    const text = event.body.trim();

    // Default Emoji Pack
    const emojiPack = {
      "😆": { reply: "😆 Funny vibes!", audio: "https://files.catbox.moe/1c6jpm.ogg" },
      "😂": { reply: "😂 Eta shune hasi thambe na!", audio: "https://files.catbox.moe/1c6jpm.ogg" },
      "😠": { reply: "😠 Eita ragi mood audio!", audio: "https://files.catbox.moe/iky7gi.mp3" },
      "😵‍💫": { reply: "😵‍💫 Ghure gese naki? 😂", audio: "https://files.catbox.moe/8o4is6.mp4" },
      "😁": { reply: "😁 Smiley mode ON!", audio: "https://files.catbox.moe/1c6jpm.ogg" },
      "😸": { reply: "😸 Cat smile detected!", audio: "https://files.catbox.moe/1c6jpm.ogg" },
      "🖕": { reply: "🖕 Badmashi!", audio: "https://files.catbox.moe/eydq8h.mp3" }
    };

    // Your Added Audio Map with body replies
    const emojiAudioMap = {
      "🥱": { txt: "🥱 Ghum ashche naki?", url: "https://files.catbox.moe/9pou40.mp3" },
      "🤡": { txt: "🤡 Pagol mode on!", url: "https://files.catbox.moe/9w1nyb.mp3" },
      "😌": { txt: "😌 Ahh shanti!", url: "https://files.catbox.moe/epqwbx.mp3" },
      "🥺": { txt: "🥺 Aww cute!", url: "https://files.catbox.moe/wc17iq.mp3" },
      "🤭": { txt: "🤭 Lajja pailo? 😂", url: "https://files.catbox.moe/cu0mpy.mp3" },
      "😅": { txt: "😅 Ulta palta hoye gelo!", url: "https://files.catbox.moe/jl3pzb.mp3" },
      "😏": { txt: "😏 Ei smug look!", url: "https://files.catbox.moe/z9e52r.mp3" },
      "😞": { txt: "😞 Off hoye gese mood...", url: "https://files.catbox.moe/tdimtx.mp3" },
      "🤫": { txt: "🤫 Chup chup!", url: "https://files.catbox.moe/0uii99.mp3" },
      "🍼": { txt: "🍼 Baby vibe!", url: "https://files.catbox.moe/p6ht91.mp3" },
      "🤔": { txt: "🤔 Think mode activated!", url: "https://files.catbox.moe/hy6m6w.mp3" },
      "🥰": { txt: "🥰 Love vibes!", url: "https://files.catbox.moe/dv9why.mp3" },
      "🤦": { txt: "🤦 Ei ki korli!", url: "https://files.catbox.moe/ivlvoq.mp3" },
      "😘": { txt: "😘 Kiss pack!", url: "https://files.catbox.moe/sbws0w.mp3" },
      "😑": { txt: "😑 Expressionless!", url: "https://files.catbox.moe/p78xfw.mp3" },
      "😢": { txt: "😢 Crying mood...", url: "https://files.catbox.moe/shxwj1.mp3" },
      "🙊": { txt: "🙊 Bolbo na!", url: "https://files.catbox.moe/3bejxv.mp3" },
      "🤨": { txt: "🤨 Hmm suspicious!", url: "https://files.catbox.moe/4aci0r.mp3" },
      "😡": { txt: "😡 Ragi mood!", url: "https://files.catbox.moe/shxwj1.mp3" },
      "🙈": { txt: "🙈 Dekhte parlam na!", url: "https://files.catbox.moe/3qc90y.mp3" },
      "😾": { txt: "😾 Cat angry!", url: "https://files.catbox.moe/kyujsc.mp3" },
      "😍": { txt: "😍 Cute love!", url: "https://files.catbox.moe/qjfk1b.mp3" },
      "😭": { txt: "😭 Biyoganto scene!", url: "https://files.catbox.moe/itm4g0.mp3" },
      "😱": { txt: "😱 OMG!", url: "https://files.catbox.moe/mu0kka.mp3" },
      "😻": { txt: "😻 Cat love!", url: "https://files.catbox.moe/y8ul2j.mp3" },
      "😿": { txt: "😿 Cat crying...", url: "https://files.catbox.moe/tqxemm.mp3" },
      "😓": { txt: "😓 Stress mode!", url: "https://files.catbox.moe/6yanv3.mp3" },
      "💔": { txt: "💔 Broken heart...", url: "https://files.catbox.moe/k1zu2i.mp3" },
      "🥹": { txt: "🥹 Emotional!", url: "https://files.catbox.moe/jf85xe.mp3" },
      "🗣️": { txt: " wahhh", url: "https://files.catbox.moe/hvsecd.mp3" },
      "😩": { txt: "😩 Exhausted!", url: "https://files.catbox.moe/b4m5aj.mp3" },
      "🫣": { txt: "🫣 Lukiye dekchi!", url: "https://files.catbox.moe/ttb6hi.mp3" },
      "🐸": { txt: "🐸 Frog gang!", url: "https://files.catbox.moe/mi6awe.mp3" }
    };

    // Merge All With Body Text
    for (const emo in emojiAudioMap) {
      emojiPack[emo] = {
        reply: emojiAudioMap[emo].txt,
        audio: emojiAudioMap[emo].url
      };
    }

    // If emoji matched → reply with body + audio
    if (emojiPack[text]) {
      return message.reply({
        body: emojiPack[text].reply,
        attachment: await global.utils.getStreamFromURL(emojiPack[text].audio)
      });
    }
  }
};
