# MON Format

JSON sucks for configuration files. It's too easy to fuck up and forget a comma or add an extra at the end of a list. JSON also doesn't support comments. MON is intended to map pretty closely to JSON, be easy to parse and even easier for humans to read and write.

```
user {
  name "Tony McCoy"
}

clients {
  TestCo {
    contact "Joe MacMillan"
    company "TestCo"
    address {
      street "123 Noice St."
      city "Coolsville"
      state "CA"
      zip "11111"
    }
  }
}

projects {
  coolgame {
    name "Super Cool Game"
    hourlyRate 50
    client @clients/TestCo
  }
}

sync {
  autoSync on
  services [
    {
      name "S3"
      bucket "punch-cloud"
      region "us-west-2"
      credentials {
        secretAccessKey "XXXX"
        accessKeyId "XXXX"
      }
    }
  ]
}

textColors off

```

### Value Types

Basically, keys are words followed by a space and some kind of value. Values can be strings (`"string"`), objects (`{}`), arrays (`[]`), integers (`5`), floats (`5.0`), booleans (`true`/`false` or the equivalent `on`/`off`). Objects and arrays can contain other values.

Objects contain other keyed values:

```
object {
  key 1
  other "thing"
}
```

While arrays can only contain non-keyed values:

```
array [
  1
  "thing"
]
```

### Keys

Keys can contain `A-Za-z0-9_-`. All keys are interpreted as strings.

### Types

- String
- Integer (number without decimal point)
- Float (number with decimal point)
- Boolean (true/false/on/off)
- Array (`[]`) (can contain multiple types)
- Object (`{}`) (contains other key value pairs)
- Reference (@object/sub/paths) (substituted by parser, but still technically a type)

### Separators

The language follows a simple format. Everything is a key-value pair where the key and value are separated by a space. Sets of key-value pairs can be divided by a comma or `\n`:

```
key "value"
another {
  this "is inside an object value"
  commas "are optional with multiple lines"
}
more {
  but-are "required to", join "multiple pairs on a", single "line"
}
```

### Comments

Comments start with `#` and continue until the end of the line.

### Internal References

Non-string values beginning with `@` are slash-separated paths to other values in the same document. The `@` could be thought of as the *root* of the file. So that `@clients/TestCo` in the project configuration above would point to

```
clients {
  TestCo {
    ...
  }
}
```

Kind of an absolute path into any neighboring object. The reference gets connected when the file is parsed, so in JavaScript you could access `projects.coolgame.client.contact`, which would point to the same value as `clients.TestCo.contact`.

### (Semi-)Optional Commas

In arrays and objects, newline characters outside of strings are treated the same as commas. In other words, commas are optional if your keys and values are broken into multiple lines, but required if multiple key value pairs are on the same line:

```
# OK
object { key 1, other "thing" }
object {
  key 1
  other "thing"
}
object {
  key 1,
  other "thing"
}

# Not OK
object { key 1 other "thing" }
```

### Multiline Strings

Strings can contain newlines:

```
multiline "
  this
  is
  totally
  fine
"

# Which is identical to this:
"\n  this\n  is\n  totally\n  fine\n"

singleline "This\nIs\nAlso\nOk"
```