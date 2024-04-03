define([
  'core/origin',
  'backbone-forms'
], function(Origin, BackboneForms) {

  var templates = Handlebars.templates;
  var fieldTemplate = templates.field;
  var templateData = Backbone.Form.Field.prototype.templateData;
  var initialize = Backbone.Form.editors.Base.prototype.initialize;
  var textInitialize = Backbone.Form.editors.Text.prototype.initialize;
  var textAreaRender = Backbone.Form.editors.TextArea.prototype.render;
  var textAreaSetValue = Backbone.Form.editors.TextArea.prototype.setValue;

  Backbone.Form.prototype.constructor.template = templates.form;
  Backbone.Form.Fieldset.prototype.template = templates.fieldset;
  Backbone.Form.Field.prototype.template = fieldTemplate;
  Backbone.Form.NestedField.prototype.template = fieldTemplate;

  // add reset to default handler
  Backbone.Form.Field.prototype.events = {
    'click [data-action="default"]': function() {
      this.setValue(this.editor.defaultValue);
      this.editor.trigger('change', this);

      return false;
    }
  };

  // merge schema into data
  Backbone.Form.Field.prototype.templateData = function() {
    return _.extend(templateData.call(this), this.schema, {
      isDefaultValue: _.isEqual(this.editor.value, this.editor.defaultValue)
    });
  };

  // use default from schema and set up isDefaultValue toggler
  Backbone.Form.editors.Base.prototype.initialize = function(options) {
    var schemaDefault = options.schema.default;

    if (schemaDefault !== undefined && options.id) {
      this.defaultValue = schemaDefault;
    }

    this.listenTo(this, 'change', function() {
      if (this.hasNestedForm) return;

      var isDefaultValue = _.isEqual(this.getValue(), this.defaultValue);

      this.form.$('[data-editor-id="' + this.id + '"]')
        .toggleClass('is-default-value', isDefaultValue);
    });

    initialize.call(this, options);
  };

  // disable automatic completion on text fields if not specified
  Backbone.Form.editors.Text.prototype.initialize = function(options) {
    textInitialize.call(this, options);

    if (!this.$el.attr('autocomplete')) {
      this.$el.attr('autocomplete', 'off');
    }
  };

  // render ckeditor in textarea
  Backbone.Form.editors.TextArea.prototype.render = function() {
    textAreaRender.call(this);

    function until(conditionFunction) {
      function poll(resolve) {
        if (conditionFunction()) {
          resolve();
          return;
        }
        setTimeout(function() {
          poll(resolve)
        }, 10);
      }
      return new Promise(poll);
    }
    function isAttached($element) {
      return function() {
        return Boolean($element.parents('body').length);
      };
    }

    until(isAttached(this.$el)).then(function() {
      ClassicEditor
      .create( this.$el[0], {
        licenseKey: '',
        //plugins: ['Alignment', 'Autoformat', 'AutoLink', 'BlockQuote', 'Bold', 'CKFinderUploadAdapter', 'CloudServices', 'Code', 'CodeBlock', 'DataFilter', 'DataSchema', 'Essentials', 'FindAndReplace', 'GeneralHtmlSupport', 'Italic', 'Link', 'List', 'ListProperties', 'Paragraph', 'PasteFromOffice', 'RemoveFormat', 'SourceEditing', 'SpecialCharacters', 'SpecialCharactersCurrency', 'SpecialCharactersLatin', 'SpecialCharactersMathematical', 'SpecialCharactersText', 'Strikethrough', 'Subscript', 'Superscript', 'Table', 'TableCaption', 'TableCellProperties', 'TableColumnResize', 'TableProperties', 'TableToolbar', 'Underline'],
        toolbar: { 
          items: ["sourceEditing","|","style","|","bold","italic","underline","strikethrough","highlight","subscript","superscript","|","bulletedList","numberedList","alignment","|","-","codeBlock","code","|","link","blockQuote","insertTable","specialCharacters","|","undo","redo","findAndReplace","removeFormat","textPartLanguage"], 
          shouldNotGroupWhenFull: true 
        },
        style: {
          definitions: [
            {
                name: 'Keypoint',
                element: 'p',
                classes: [ 'keypoint' ]
            },
            {
              name: 'Warning',
              element: 'p',
              classes: [ 'warning' ]
            },
            {
              name: 'AT notes',
              element: 'p',
              classes: [ 'at-notes' ]
            },
            // {
            //     name: 'Page summary',
            //     element: 'ul',
            //     classes: [ 'page-summary' ]
            // },
            // {
            //     name: 'Grid list',
            //     element: 'ul',
            //     classes: [ 'grid' ]
            // },
            {
              name: 'Shaded section',
              element: 'p',
              classes: [ 'shaded' ]
            },
            {
              name: 'Cite',
              element: 'cite',
              classes: [ '' ]
            },
            {
              name: 'Kbd',
              element: 'kbd',
              classes: [ '' ]
            },
            {
              name: 'Quote',
              element: 'q',
              classes: [ '' ]
            },
            {
              name: 'Note',
              element: 'p',
              classes: [ 'note' ]
            },
          ]
        },
        link: {
          addTargetToExternalLinks: true,
          decorators: {
            isExternal: {
              mode: 'manual',
              label: 'Open in a new tab',
              attributes: {
                target: '_blank'
              }
            }
          }
        },
        htmlSupport: {
          allow: [  
            {
              name: /^(div|p|q|kbd|dfn|mark|cite|figcaption)$/,
              classes: true,
              attributes: /^(tabindex|role|aria-label)$/
            },
            {
              name: "a",
              attributes: "target"
            },
            {
              name: "blockquote",
              attributes: "cite"
            }
          ]
        },
        codeBlock: {
          indentSequence: "  ",
          languages: [
            { language: 'html', label: 'HTML' },
            { language: 'css', label: 'CSS' },              
            { language: 'javascript', label: 'JavaScript' },
            { language: 'java', label: 'Java' },
            { language: 'python', label: 'Python' },
            { language: 'typescript', label: 'TypeScript' },
            { language: 'xml', label: 'XML' },
            { language: 'cs', label: 'C#' },
            { language: 'cpp', label: 'C++' }
          ]
        },
        language: {
          textPartLanguage: [
            { title: 'English', languageCode: 'en' },
            { title: 'Français', languageCode: 'fr' },
            { title: 'Deutsch', languageCode: 'de' },
            { title: 'Español', languageCode: 'es' },
            { title: '日本語', languageCode: 'ja' },
            { title: '한국어', languageCode: 'ko' },
            { title: 'Nederlands', languageCode: 'nl' },
            { title: '中文 (简体)', languageCode: 'zh-CN' }
          ]
        },
        on: {
          change: function() {
            this.trigger('change', this);
          }.bind(this),
          instanceReady: function() {
            var writer = this.dataProcessor.writer;
            var elements = Object.keys(CKEDITOR.dtd.$block);

            var rules = {
              indent: false,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false
            };

            writer.indentationChars = '';
            writer.lineBreakChars = '';
            elements.forEach(function(element) { writer.setRules(element, rules); });
          }
        }
      } )
      .then( editor => {
        this.editor = editor;
        if (!window.tpgiCKEditorInstances) {
          window.tpgiCKEditorInstances = {};
        }
        console.log("here");
        window.tpgiCKEditorInstances[this.$el[0].id] = editor;
      } )
      .catch( error => {
        console.error( 'Oops, something went wrong!' );
        console.error( error );
      } );
      // this.editor = CKEDITOR.replace(this.$el[0], {
      //   dataIndentationChars: '',
      //   disableNativeSpellChecker: false,
      //   enterMode: CKEDITOR[Origin.constants.ckEditorEnterMode],
      //   entities: false,
      //   extraAllowedContent: Origin.constants.ckEditorExtraAllowedContent,
      //   on: {
      //     change: function() {
      //       this.trigger('change', this);
      //     }.bind(this),
      //     instanceReady: function() {
      //       var writer = this.dataProcessor.writer;
      //       var elements = Object.keys(CKEDITOR.dtd.$block);

      //       var rules = {
      //         indent: false,
      //         breakBeforeOpen: false,
      //         breakAfterOpen: false,
      //         breakBeforeClose: false,
      //         breakAfterClose: false
      //       };

      //       writer.indentationChars = '';
      //       writer.lineBreakChars = '';
      //       elements.forEach(function(element) { writer.setRules(element, rules); });
      //     }
      //   },
      //   toolbar: [
      //     { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'ShowBlocks' ] },
      //     { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
      //     { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll' ] },
      //     { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv' ] },
      //     { name: 'direction', items: [ 'BidiLtr', 'BidiRtl' ] },
      //     '/',
      //     { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
      //     { name: 'styles', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
      //     { name: 'links', items: [ 'Link', 'Unlink' ] },
      //     { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
      //     { name: 'insert', items: [ 'SpecialChar', 'Table' ] },
      //     { name: 'tools', items: [] },
      //     { name: 'others', items: [ '-' ] }
      //   ]
      // });
    }.bind(this));

    return this;
  };

  // get data from ckeditor in textarea
  Backbone.Form.editors.TextArea.prototype.getValue = function() {
    return this.editor.getData();
  };

  // set value in ckeditor
  Backbone.Form.editors.TextArea.prototype.setValue = function(value) {
    textAreaSetValue.call(this, value);

    if (this.editor) {
      this.editor.setData(value);
    }
  };

  // ckeditor removal
  Backbone.Form.editors.TextArea.prototype.remove = function() {
    //this.editor.removeAllListeners();
    //CKEDITOR.remove(this.editor);
    //this.editor.destroy()
    //delete window.tpgiCKEditorInstances[this.$el[0].id];
  };

  // add override to allow prevention of validation
  Backbone.Form.prototype.validate = function(options) {
    var self = this,
        fields = this.fields,
        model = this.model,
        errors = {};

    options = options || {};

    //Collect errors from schema validation
    // passing in validate: false will stop validation of the backbone forms validators
    if (!options.skipModelValidate) {
      _.each(fields, function(field) {
        var error = field.validate();

        if (!error) return;

        var title = field.schema.title;

        if (title) {
            error.title = title;
        }

        errors[field.key] = error;
      });
    }

    //Get errors from default Backbone model validator
    if (!options.skipModelValidate && model && model.validate) {
      var modelErrors = model.validate(this.getValue());

      if (modelErrors) {
        var isDictionary = _.isObject(modelErrors) && !_.isArray(modelErrors);

        //If errors are not in object form then just store on the error object
        if (!isDictionary) {
          errors._others = errors._others || [];
          errors._others.push(modelErrors);
        }

        //Merge programmatic errors (requires model.validate() to return an object e.g. { fieldKey: 'error' })
        if (isDictionary) {
          _.each(modelErrors, function(val, key) {
            //Set error on field if there isn't one already
            if (fields[key] && !errors[key]) {
              fields[key].setError(val);
              errors[key] = val;
            }

            else {
              //Otherwise add to '_others' key
              errors._others = errors._others || [];
              var tmpErr = {};
              tmpErr[key] = val;
              errors._others.push(tmpErr);
            }
          });
        }
      }
    }

    return _.isEmpty(errors) ? null : errors;
  };

  // allow hyphen to be typed in number fields
  Backbone.Form.editors.Number.prototype.onKeyPress = function(event) {
    var self = this,
      delayedDetermineChange = function() {
        setTimeout(function() {
        self.determineChange();
      }, 0);
    };

    //Allow backspace
    if (event.charCode === 0) {
      delayedDetermineChange();
      return;
    }

    //Get the whole new value so that we can prevent things like double decimals points etc.
    var newVal = this.$el.val()
    if( event.charCode != undefined ) {
      newVal = newVal + String.fromCharCode(event.charCode);
    }

    var numeric = /^-?[0-9]*\.?[0-9]*?$/.test(newVal);

    if (numeric) {
      delayedDetermineChange();
    }
    else {
      event.preventDefault();
    }
  };

});
