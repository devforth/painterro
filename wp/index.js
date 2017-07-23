(function() {

  var paintrerro = Painterro({
    initText: 'Press Prn Scr, Ctrl+V to paste a screenshot',
    colorScheme: {
      main: '#23282d',
      control: '#444',
      controlContent: '#cccccc',
      activeControl: '#015c88',
      activeControlContent: '#ffffff',
      controlActiveControl: '#cccccc',
      inputBackground: '#ffffff',
      backgroundColor: '#999999',
      dragOverBarColor: '#899dff',
      hoverControl: '#191e23',
      hoverControlContent: '#00b9eb',
    },
    saveHandler: function (image, done) {
      console.log('media', _wpMediaViewsL10n.settings)

      var formData = new FormData()
      formData.append('name', image.suggestedFileName());
      formData.append('action', 'upload-attachment');
      formData.append('_wpnonce', ptro_media_form_nonce);
      formData.append('post_id', ptro_post_id);
      formData.append('async-upload', image.asBlob(), image.suggestedFileName());

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/wp-admin/async-upload.php', true);
      xhr.onload = function () {
        var response = JSON.parse(this.responseText);
        console.log('Upload done:', response);
        var xhrInsert = new XMLHttpRequest();
        xhrInsert.open("POST", "/wp-admin/admin-ajax.php");
        var formDataInsert = new FormData();
        formDataInsert.append('nonce', ptro_media_send_to_editor_nonce);
        formDataInsert.append('attachment[id]', response.data.id);
        formDataInsert.append('attachment[post_content]', '');
        formDataInsert.append('attachment[post_excerpt]', '');
        formDataInsert.append('attachment[align]','none');
        formDataInsert.append('attachment[image-size]','full');
        formDataInsert.append('html', '<img src="" width="' + response.data.sizes.full.width +
          '" height="'+ response.data.sizes.full.height +'" alt="" class="wp-image-110 alignnone size-full" />');
        formDataInsert.append('post_id', 'ptro_post_id');
        formDataInsert.append('action', 'send-attachment-to-editor');

        xhrInsert.send(formDataInsert);
        xhrInsert.onload = function (e) {
          var response = JSON.parse(this.responseText);
          console.log('Inserting done:', response);
          paintrerro.mceEditor.execCommand("mceInsertContent", 0, response.data);
          done(true);
        }
        xhrInsert.onerror = function (e) {
          console.error('Error inserting text image: ', e)
          done(true)
        };
      };
      xhr.onerror = function (e) {
        console.error('Error uploading image: ', e)
        done(true)
      };
      xhr.send(formData)
    }
  });
  tinymce.create("tinymce.plugins.painterro_plugin", {

    //url argument holds the absolute url of our plugin directory
    init : function(ed, url) {
      paintrerro.mceEditor = ed;
      //add new button
      ed.addButton("painterro", {
          title : "Open Painterro",
          cmd : "painterro_cmd",
          'icon' : "painterro ptro-icon ptro-icon-painterro",
      });

      //button functionality.
      ed.addCommand("painterro_cmd", function() {
        paintrerro.show();
      });

    },

    createControl : function(n, cm) {
        return null;
    },

    getInfo : function() {
        return {
            longname : "Painterro",
            author : "Ivan Borshchov",
            version : "1"
        };
    }
  });

  tinymce.PluginManager.add("painterro_plugin", tinymce.plugins.painterro_plugin);
})();

