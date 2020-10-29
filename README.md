# Wasm Memory Preview

A simple [online tool](https://charlycst.github.io/wasm-mem-preview/) to visualize wasm memory.

## Usage

To upload a wasm file click on `load .wasm file`, then all functions exported by the as well as the memory will be displayed.

You can choose what arguments are passed and then run the functions by clicking `run`. Pressing enter while editing an argument also run the function.
If a function is missing, double check that it is correctly exported.

Similarly, you can jump at a given offset of the memory by clicking `goto`, or pressing enter while editing the `goto` field.
To inspect close addresses it is also possible 'scroll' the memory using the mouse wheel.

## Limitations

Currently only the first memory page (64Ki) can be viewed, this is enough for all my use cases, but feel free to open an issue if you see value in inspecting a larger portion of the memory.

The website is designed for desktop use, and will probably not render well on small screens.

## Bugs and feature requests

Feel free to open an issue!
