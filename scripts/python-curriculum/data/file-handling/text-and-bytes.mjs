// Files topic: Text, bytes and encodings. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "text_vs_binary",
  title: "Text, bytes and encodings",
  paragraphs: [
    "Under the hood, every file is a sequence of **bytes**: numbers from 0 to 255. A text file is bytes that stand for characters, according to an **encoding**, a table that says which bytes mean which character. An image, a sound or a zip file is bytes with its own structure, which isn't text at all.",
    "Python keeps the two apart. A `str` is text, made of characters; a `bytes` value is raw bytes, written with a `b` in front: `b\"hi\"`. `encode` turns text into bytes and `decode` turns bytes back into text, both using an encoding:",
    "```\ntext = \"café\"\ndata = text.encode(\"utf-8\")\nprint(data)                  # b'caf\\xc3\\xa9'\nprint(len(text), len(data))  # 4 5: the é takes two bytes\nprint(data.decode(\"utf-8\"))  # café\n```",
    "**UTF-8** is the encoding almost everything uses today. It stores the plain English letters, digits and punctuation (the ASCII characters) as one byte each, and everything else, like é, ø, ж or 😀, as two to four bytes. That's why the number of characters and the number of bytes can differ.",
    "Decoding with the wrong encoding gives garbled text (`cafÃ©`) or a `UnicodeDecodeError`. That's why you pass `encoding=\"utf-8\"` to `open`: without it, Python uses the computer's default, which on some Windows machines is an older encoding, and the same program can read the same file differently on two computers.",
    "For files that aren't text, open them in **binary mode** by adding `b` to the mode: `\"rb\"` or `\"wb\"`. Then `read()` returns `bytes` and `write()` takes `bytes`, with no encoding and no line-break translation. Indexing a `bytes` value gives a number: `b\"ABC\"[0]` is `65`.",
    "```\nwith open(\"tiny.bin\", \"wb\") as f:\n    f.write(bytes([0, 1, 2, 255]))\n\nwith open(\"tiny.bin\", \"rb\") as f:\n    data = f.read()\nprint(data, list(data), len(data))   # b'\\x00\\x01\\x02\\xff' [0, 1, 2, 255] 4\n```",
    "Many file types start with a fixed **signature**, a few bytes that identify them: every PNG image starts with `b\"\\x89PNG\\r\\n\\x1a\\n\"`, and every zip file with `b\"PK\"`. Reading the first few bytes in binary mode is how programs recognise a file whatever its name says.",
    "Big binary files, like videos, are best copied in **chunks**: `f.read(65536)` reads up to 64 KB at a time, and a loop continues until `read` returns `b\"\"`, so the whole file never has to fit in memory.",
  ],
  sandboxCode: "for text in [\"hello\", \"café\", \"日本\", \"😀\"]:\n    data = text.encode(\"utf-8\")\n    print(f\"{text!r}: {len(text)} characters, {len(data)} bytes, {data}\")\n\nwith open(\"tiny.bin\", \"wb\") as f:\n    f.write(bytes([72, 105, 33]))\nwith open(\"tiny.bin\", \"rb\") as f:\n    data = f.read()\nprint(data, list(data), data.decode(\"ascii\"))",
  sandboxSnippets: [
    snippet("Encode and decode", "data = \"Grüße\".encode(\"utf-8\")\nprint(data, len(data))\nprint(data.decode(\"utf-8\"))"),
    snippet("The wrong encoding", "data = \"café\".encode(\"utf-8\")\nprint(data.decode(\"latin-1\"))\nprint(data.decode(\"ascii\"))"),
    snippet("Bytes are numbers", "data = b\"ABC\"\nprint(data[0], list(data), bytes([97, 98, 99]))"),
    snippet("Binary mode", "with open(\"b.bin\", \"wb\") as f:\n    f.write(b\"\\x00\\xff\")\nwith open(\"b.bin\", \"rb\") as f:\n    print(f.read())\nwith open(\"b.bin\", \"w\") as f:\n    f.write(b\"\\x00\")"),
    snippet("Chunks", "with open(\"big.bin\", \"wb\") as f:\n    f.write(bytes(1000))\nsizes = []\nwith open(\"big.bin\", \"rb\") as f:\n    while True:\n        chunk = f.read(300)\n        if not chunk:\n            break\n        sizes.append(len(chunk))\nprint(sizes)"),
  ],
  readMore: { label: "Python docs: Unicode HOWTO", url: "https://docs.python.org/3/howto/unicode.html", source: "Python docs" },
  challenges: [
    task("easy", "Text to bytes", {
      prompt: "Set `data` to `text` encoded as UTF-8 bytes.",
      starter: "text = \"Grüße\"\n",
      hint: "`text.encode(\"utf-8\")`.",
      solution: "text = \"Grüße\"\ndata = text.encode(\"utf-8\")",
      tests: [
        ["data is right", "data == b\"Gr\\xc3\\xbc\\xc3\\x9fe\""],
      ],
    }),
    task("easy", "Bytes to text", {
      prompt: "Set `text` to `data` decoded from UTF-8.",
      starter: "data = b\"caf\\xc3\\xa9\"\n",
      hint: "`data.decode(\"utf-8\")`.",
      solution: "data = b\"caf\\xc3\\xa9\"\ntext = data.decode(\"utf-8\")",
      tests: [
        ["text is café", "text == \"café\""],
      ],
    }),
    task("easy", "Characters and bytes", {
      prompt: "Set `chars` to the number of characters in `word` and `size` to the number of bytes it takes in UTF-8.",
      starter: "word = \"naïve\"\n",
      hint: "`len(word)` and `len(word.encode(\"utf-8\"))`.",
      solution: "word = \"naïve\"\nchars = len(word)\nsize = len(word.encode(\"utf-8\"))",
      tests: [
        ["chars is 5", "chars == 5"],
        ["size is 6", "size == 6"],
      ],
    }),
    task("medium", "Write bytes", {
      prompt: "Write the bytes 0, 1, 2 and 255 into `tiny.bin`, in binary mode.",
      hint: "Open with `\"wb\"` and write `bytes([0, 1, 2, 255])`.",
      solution: "with open(\"tiny.bin\", \"wb\") as f:\n    f.write(bytes([0, 1, 2, 255]))",
      tests: [
        ["tiny.bin is right", "open(\"tiny.bin\", \"rb\").read() == bytes([0, 1, 2, 255])"],
      ],
    }),
    task("medium", "Read bytes", {
      prompt: "Set `size` to the number of bytes in `photo.png` and `first` to its first byte (a number), reading in binary mode.",
      hint: "Open with `\"rb\"`, `data = f.read()`, then `len(data)` and `data[0]`.",
      solution: "with open(\"photo.png\", \"rb\") as f:\n    data = f.read()\nsize = len(data)\nfirst = data[0]",
      setup: "import os as _os\nwith open('photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f')\n",
      tests: [
        ["size is 24", "size == 24"],
        ["first is 137", "first == 137"],
      ],
    }),
    task("medium", "Plain English only?", {
      prompt: "Define `is_ascii(text)` that returns `True` when every character of `text` takes exactly one byte in UTF-8.",
      hint: "Compare `len(text)` with `len(text.encode(\"utf-8\"))`.",
      solution: "def is_ascii(text):\n    return len(text) == len(text.encode(\"utf-8\"))",
      tests: [
        ["hello", "is_ascii(\"hello\") is True"],
        ["café", "is_ascii(\"café\") is False"],
        ["empty", "is_ascii(\"\") is True"],
      ],
    }),
    task("hard", "Is it a PNG?", {
      prompt: "Define `is_png(name)` that returns whether a file starts with the PNG signature `b\"\\x89PNG\\r\\n\\x1a\\n\"`, reading only the first 8 bytes.",
      hint: "Open with `\"rb\"` and compare `f.read(8)` with the signature.",
      solution: "def is_png(name):\n    with open(name, \"rb\") as f:\n        return f.read(8) == b\"\\x89PNG\\r\\n\\x1a\\n\"",
      setup: "import os as _os\nwith open('photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f')\nwith open('fake.png', \"wb\") as _f:\n    _f.write(b'not an image at all')\n",
      tests: [
        ["A real PNG", "is_png(\"photo.png\") is True"],
        ["Pretending", "is_png(\"fake.png\") is False"],
      ],
    }),
    task("hard", "Fix the garbled text", {
      prompt: "`garbled` is UTF-8 text that was wrongly decoded as `latin-1`. Turn it back into the right text: encode it as `latin-1` to get the original bytes, then decode them as UTF-8.",
      starter: "garbled = \"cafÃ©\"\n",
      hint: "`fixed = garbled.encode(\"latin-1\").decode(\"utf-8\")`.",
      solution: "garbled = \"cafÃ©\"\nfixed = garbled.encode(\"latin-1\").decode(\"utf-8\")",
      tests: [
        ["fixed is café", "fixed == \"café\""],
      ],
    }),
    task("expert", "Copy in chunks", {
      prompt: "Define `copy_binary(src, dst, chunk_size=4)` that copies any file in binary mode, `chunk_size` bytes at a time, and returns the number of chunks it read.",
      hint: "Open both files (`\"rb\"` and `\"wb\"`), then loop: `chunk = fin.read(chunk_size)`; stop on `b\"\"`; write it and count.",
      solution: "def copy_binary(src, dst, chunk_size=4):\n    chunks = 0\n    with open(src, \"rb\") as fin, open(dst, \"wb\") as fout:\n        while True:\n            chunk = fin.read(chunk_size)\n            if not chunk:\n                break\n            fout.write(chunk)\n            chunks += 1\n    return chunks",
      setup: "import os as _os\nwith open('photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f')\n",
      tests: [
        ["Six chunks of 4", "copy_binary(\"photo.png\", \"copy.png\") == 6"],
        ["An exact copy", "open(\"copy.png\", \"rb\").read() == open(\"photo.png\", \"rb\").read()"],
        ["Bigger chunks", "copy_binary(\"photo.png\", \"c2.png\", 10) == 3"],
      ],
    }),
    task("expert", "A checksum", {
      prompt: "Define `checksum(name)` that returns the sum of all the bytes in a file, modulo 256: a quick way to spot whether two files differ.",
      hint: "Read in `\"rb\"`; looping over `bytes` gives numbers, so `sum(data) % 256`.",
      solution: "def checksum(name):\n    with open(name, \"rb\") as f:\n        return sum(f.read()) % 256",
      setup: "import os as _os\nwith open('photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f')\nwith open('abc.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('abc')\n",
      tests: [
        ["photo.png", "checksum(\"photo.png\") == sum(open(\"photo.png\", \"rb\").read()) % 256"],
        ["A known file", "checksum(\"abc.txt\") == (97 + 98 + 99) % 256"],
      ],
    }),
  ],
  questions: [
    mc("What is a file made of, underneath?", ["Characters", "Bytes: numbers from 0 to 255", "Lines", "Python objects"], 1),
    mc("What does `\"é\".encode(\"utf-8\")` give?", ["`\"é\"`", "One byte", "Two bytes: `b\"\\xc3\\xa9\"`", "An error"], 2),
    mc("What does `decode` do?", ["Turns bytes into text, using an encoding", "Turns text into bytes", "Compresses a file", "Removes accents"], 0),
    mc("Why can `len(text)` and `len(text.encode(\"utf-8\"))` differ?", ["Encoding adds a line break", "Bytes are shorter", "They never differ", "Characters like é take more than one byte in UTF-8"], 3),
    qShort("What is `b\"A\"[0]`? (a number)", "65"),
    mc("Which mode reads a file as bytes?", ["`\"r\"`", "`\"rb\"`", "`\"rt\"`", "`\"b\"`"], 1),
    mc("What happens if you decode UTF-8 bytes as `latin-1`?", ["Garbled text, like `cafÃ©`", "The right text", "A `FileNotFoundError`", "Empty text"], 0),
    mc("Why copy big files in chunks?", ["It is required for binary files", "Chunks compress the file", "The whole file never has to fit in memory", "It keeps the encoding"], 2),
    mc("How do programs recognise a PNG file?", ["By its name", "By its size", "By asking the user", "By its first bytes, the signature"], 3),
    mc("What does `f.read(4)` return at the end of a binary file?", ["`None`", "`b\"\"`", "An error", "`0`"], 1),
  ],
})
