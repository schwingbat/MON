# mon README

Syntax highlighting for `.mon` files.

[MON](https://github.com/schwingbat/MON) is Minimal Object Notation; a JSON-like syntax (mostly for [Punch](https://github.com/schwingbat/punch-cli) config files right now) with a minimum of syntax so it's easier to read, easier to write and still easy to parse and map to JSON. It's a bit like what you might get if you tried to write JSON with Nginx config file syntax.

MON is not quite ready for public use yet. If you want to check out the current progress you can visit [the GitHub project](https://github.com/schwingbat/MON).

## What?

It looks like this:

```mon

projects {
  my-project {
    name "A Project Object"
    description "Lorem ipsum dolor sit amet adipiscing elit, etc."
    arrays [1 2 3]
    number 1_999_999.99
  }

  # reference is 1_999_999.99 (and this is a comment)
  reference @projects/my-project/number
}

```

## Release Notes

### 1.0.0

Initial release.