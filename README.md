 
[GitHub](https://github.com/ivictbor/painterro) | [npm](https://www.npmjs.com/package/painterro)

Painterro is singlefile JavaScript paint component which allows to edit images directly in browser.
It can be easily integrated into your website or blog by including only one `painterro.js` file and calling init code.

With Painterro you can:
- Paste image from clipboard (for example screenshot)
- Crop image by defined area
- Paint primitives (alpha color can be used)
- Add text
- Rotate / Resize image

![Painterro preview](https://raw.githubusercontent.com/ivictbor/painterro/master/docs/preview.png)

Example usecase: You make screenshot by pressing `PrtSc` button, then open Painterro on your website, paste image, 
crop it to interested area then highlight something with line/rectangle tool and/or add some text 
to the image.

Painterro is written with vanilla JS, without any additional frameworks to stay lightweight and minimalistic. Code 
written on ES6 which transplited by Babel and packed using webpack.


Table of contents
=================

  * [Table of contents](#table-of-contents)
  * [Installation](#installation)
    * [With npm](#with-npm)
    * [By including script](#by-including-script)
  * [Supported hotkeys](#supported-hotkeys)
  * [Configuration](#configuration)
    * [UI color scheme](#ui-color-scheme)
  * [Saving image](#saving-image)
    * [Base64 saving](#base64-saving)
    * [Binary saving](#binary-saving)
    * [Saving to WYSIWYG](#saving-to-wysiwyg)
  * [Development](#development)
    * [Building painterro](#building-painterro)
    * [Dev-server](#dev-server)
    * [Regenerating icons font](#regenerating-icons-font)
    * [ToDo list](#todo-list)


Installation
============


With npm
--------

If you are using npm you can run:
```bash
npm install painterro --save
```
Then in your code

```js
import Painterro from 'painterro'
...
Painterro().show()
```

By including script
-------------------

You can download latest `painterro-*.min.js` here https://github.com/ivictbor/painterro/releases/ 
or [build it by yourself](#building-painterro).

Then insert <script> e.g:
```html
<script src="https://github.com/ivictbor/painterro/releases/download/0.1.5/painterro-0.1.5.min.js"></script>
```
Then in your code:
```html
<script>
  Painterro().show()
</script>
```

Read next
---------

To be able save your images on server see [Saving image](#saving-image). For configurations see [Configuration](#configuration)

Supported hotkeys
=================

|||
|-|-|
| `Ctrl + Z` | Cancel last operation |
| `Ctrl + V` | Paste image from clipboard (replace all that drawn) |
| `Shift` when drawing **rect**/**ellipse** | Draw **square**/**circle** |
| `Shift` when drawing **line** | draw at angles of `0`, `45`, `90`, `135` etc degrees | 
| `Alt` when using pipette | Open zoom helper |
| `Ctrl` + `Wheel mouse up/down` | Zoom image to 100% and back. Works only if image doesn't fit in the draw area (e.g. area `600x600` and you draw image `1920x1080`) |

Configuration
=============

| Param | Description | Default |
|-|-|-|
| `id` | If provided, then Painterro will be placed to some holder on page with this `id`, instead of autoholder | undefined |
|`activeColor`| Line/Text color that selected by default | '#ff0000' |
|`activeColorAlpha` | Transparancy of `activeColor` from 0.0 to 1.0, 0.0 = transparent | 1 |
|`activeFillColor` | Fill color that selected by default | '#000000' |
|`activeFillColorAlpha` | Transparancy of `activeColor` from 0.0 to 1.0 | 0 |
|`defaultLineWidth` | Line width in `px` that selected by default | 5 |
|`backgroundFillColor` | Default background color when image created/erased | "#ffffff" |
|`defaultFontSize` | Default font size in pixels | 24 |
|`defaultSize` | default image size, should be string in format `<width>x<height>` in pixel, e.g. `'200x100'`. If value is `'fill'`(default) than all container size will be used | `'fill'` |

UI color scheme
===============

Next group of params used to configure painterro user interface. 
They should be placed under `colorScheme` group, for example:
```js
Painterro({
  colorScheme: {
    main: '#fdf6b8', // make panels light-yellow
    control: '#FECF67' // change controls color
  }
}).show()
```

| Param | Description | Default |
|-|-|-|
|`main` | Color of panels, take most of UI space | '#dbebff' |
|`control` | Color of controls background (e.g. button background) | "#abc6ff" |
|`controlContent` | Content of controls (e.g. button text) | '#000000' |
|`activeControl` | Color for control when it active (e.g. button pressed) | '#7485B1' |
|`activeControlContent` | Color for activated control content | `main` |
|`inputBorderColor` | You can add border to inputs, by default color is same as `main` so borders will not be seen | `main` |
|`inputBackground` | Background of inputs | '#ffffff' |
|`inputText` | Color of text in input | `activeControl` |
|`backgroundColor`| Background color of component area which left outside of image due to it size/ratio | '#999999' |
|`dragOverBarColor`| Color of bar when dropping file to painterro | '#899dff' |

Saving image
============

You should provide your save handler, which will post/update image on server.

Base64 saving
-------------

Next example shows how to save base64 via POST json call. Example use raw `XMLHttpRequest`. Of course, 
instead you can use `fetch`, `jQuery`, etc insead. 

```js
var ptro = Painterro({
    saveHandler: function (image, done) {
      // of course, instead of raw XHR you can use fetch, jQuery, etc
      var xhr = new XMLHttpRequest(); 
      xhr.open("POST", "http://127.0.0.1:5000/save-as-base64/");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({
        image: image.asDataURL('image/png')
      }));
      xhr.onload = function (e) {
        // after saving is done, call done callback
        done(true); //done(true) will hide painterro, done(false) will leave opened
      }
    },
    activeColor: '#00b400'  // change active color to green
});
ptro.show();
```
Backend should convert base64 to binary and save file, here is python flask example (of course same can be implemented using any technology):
```python
@app.route("/save-as-base64/", methods=['POST'])
def base64_saver():
    filename = '{:10d}.png'.format(int(time()))  # generate some filename
    filepath = os.path.join(get_tmp_dir(), filename)
    with open(filepath, "wb") as fh:
        base64_data = request.json['image'].replace('data:image/png;base64,', '')
        fh.write(base64.b64decode(base64_data))

    return jsonify({})
```
See full example in `example` directory. You can run it with python3 with installed `Flask`.

Binary saving
-------------

You can also post data with binary `multipart/form-data` request which is more efficient. For example some `1920 x 1080` image took `402398` bytes for base64 upload. 
The same image took `301949` bytes with `multipart/form-data`.

```js
function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: 'image/png'});
}

var ptro = Painterro({
  saveHandler: function (image, done) {
    var formData = new FormData()
    formData.append('image', dataURItoBlob(image.asDataURL()))
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/save-as-binary/', true);
    xhr.onload = xhr.onerror = function () {
      done(true)
      window.location.reload()
    };
    xhr.send(formData)
  }
})
ptro.show();
```
Backend example:
```python
@app.route("/save-as-binary/", methods=['POST'])
def binary_saver():
    filename = '{:10d}.png'.format(int(time()))  # generate some filename
    filepath = os.path.join(get_tmp_dir(), filename)
    request.files['image'].save(filepath)

    return jsonify({})
```

Saving to WYSIWYG
-----------------

You can just insert image as data urlto any WYSIWYG editor, e.g. TinyMCE. Image that for example can be saved
```js
    tinymce.init({ selector:'textarea', });
    var ptro = Painterro({
      saveHandler: function (image, done) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, '<img src="' + image.asDataURL() + '" />');
        done(true)
      }
    })
```

Development
===========

After pulling repo install node modules:
```bash
cd painterro
npm install
```

Building painterro
------------------

```bash
npm run build
```
Result file is `build/painterro.js`

Dev-server
----------

To start hot-reload dev server for reloading code "on the fly":
```bash
npm run dev
```
Then open http://localhost:8080 with demo page

Regenerating icons font
-----------------------

Add/edit icons in `res` folder. Then run
```bash
npm run buildfont
```

ToDo list
---------

- Edit button on images (provide selector)
- Add recent colors pallete
- Add recent image sizes in resize tool
- Blur region
- Ability to save loacaly
- API for load file by URL
