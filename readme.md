# MON Format

JSON sucks for configuration files thanks to pedantic syntax and lack of comments. MON is intended to map pretty closely to JSON, but while JSON is perfect for efficient data interchange, MON is much better for humans. It's a nestable JSON-like key-value file format with comments and less syntax. What's not to love?

```mon
user {
  name "Tony McCoy"
}

clients {
  TestCo {
    contact "Joe MacMillan"
    company "TestCo"
    address "
      123 Noice St.
      Coolsville, CA 11111
    "
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

## To Do

- [ ] Errors for invalid references
- [ ] Better errors for invalid syntax


### Comments

Comments start with `#` and continue until the end of the line. My absolute, #1 monumental annoyance with JSON is a lack of comments. Solved.

### Keys

Keys can contain `A-Za-z0-9_-` (regular alphanumeric characters as well as underscore and dash). All keys are interpreted as strings, even if completely numeric.

### Data Types for Values

A MON file is essentially a big object (hash, dictionary, etc.) containing key-value pairs. Keys are always strings and values can be one of the following types:
- objects (`{}`)
- arrays (`[]`)
- strings (`"in double quotes"`)
- numbers (`5`, `3.14`, `6_300.50`)
- booleans (`true`, `false`, `on` or `off`)
- references (`@value` or `@path/to/nested/value`)

#### Objects

Objects are lists of keys and values, separated by a space. Commas are optional when using multiple lines, as line breaks are also considered valid delimiters.

```mon
object {
  key 1
  other "thing"
}

object {
  key 1,
  nested {
    objects {
      are "cool"
    }
  }
}

object { key 1, other "thing" }
```

#### Arrays

Arrays are lists of non-keyed values. Arrays don't require delimiters. Values other than strings can't contain spaces anyway, so there's no need to use more than a space between values unless you want to.

```mon
array [
  1
  "thing"
]

array [1 2 3]
array [1, 2, 3]
array [true true false]
array [[1 2] [3 [4 5]] { six "seven" }]
```

#### Strings

Strings are double quote delimited sequences of characters which can contain line breaks. Some languages have different kinds of strings that allow multiple lines. Multiline strings in MON are just strings... with... multiple lines.

```mon
key "this is a string value"

key2 "
  this is
  also a
  string value
"
```

> #### Side Note: Multiline Indentation
> In the case of multiline strings, the indentation level is decided by the first non-whitespace character. Meaning, instead of `key2` above being parsed as `"\n  this is\n  also a\n  string value\n"`, the leading spaces of all lines are stripped out because they are on the same level as the first `t`, so MON doesn't consider them indented. Instead you get this: `"this is\nalso a\nstring value"`. The empty lines and line breaks at the beginning and end are also removed.

#### Numbers

Numbers include both integers and floats. JavaScript considers them the same thing, so MON also considers them the same thing. A recommendation for MON parsers in more rigid languages is to treat numbers with decimal points as floats and numbers without as integers, but this is not an official standard. That's just what I would do.

Numbers can also contain underscores. Underscores do nothing but make longer numbers easier to read:

```mon
integer 5
pi 3.14
almostTwoMillion 1_999_999.99
```

#### Booleans

Booleans are your familiar `true` and `false`, but also include `on` and `off`, both of which parse into `true` and `false`. The latter makes more sense when using MON as a config file format involving toggling features on and off.

```mon
boolean true
alsoBoolean false
textColors on
emoji off
```

#### References

Values beginning with `@` are slash-separated absolute paths to neighboring values and objects. The `@` could be thought of as the *root* of the file.

```
clients {
  TestCo {
    contact "Joe MacMillan"
    ...
  }
}

number 5

# person's value is "Joe MacMillan"
person @clients/TestCo/contact

# newNumber's value is 5
newNumber @number

# You can also reference definitions that come later:
one @two
two [1 2 3]
```

#### No null?

Is `null` necessary? My use case for MON so far is entirely configuration files, which generally don't require a way to specify nothing. If you don't want to set an option, just leave it out. I have no reason to implement `null` personally. If you do, please create an issue and tell me your thoughts.