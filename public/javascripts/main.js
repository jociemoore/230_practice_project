
var App = {
  $main: $('main'),
  templates: {},
  contacts: [],
  renderContacts: function() {
    if (this.contacts.length >= 1) {
      $('#contents-container').empty();
      $('#contacts-container').append(this.templates['all-contacts-script']({contacts: this.contacts}));
      $('#contacts-container').removeClass('empty-contacts-container');
    } else {
      var $h3 = $('<h3></h3>').text('There are no contacts.');
      var $addBtn = $('.add-btn').clone(true);
  
      $('#contacts-container').append($h3);
      $('#contacts-container').append($addBtn);
      $('#contacts-container').addClass('empty-contacts-container');
    }
  },
  createFormObject: function() {
    var obj = {};

    $('form').serializeArray().forEach(function(input) {
      obj[input.name] = input.value;
    });

    return obj;
  },
  addContact: function() {
    var xhr = new XMLHttpRequest();
    var data = this.createFormObject();
    xhr.open('POST', '/api/contacts');
    xhr.addEventListener('load', function() {
      if (xhr.status === 201) {
        console.log('Contact added successfully.');
      } else if (xhr.status === 400) {
        console.log('Error adding contact.');
      }
      console.log('Done adding contact.');
    });
    xhr.send(data);
  },
  handleCancel: function(e) {
    e.preventDefault();

    $('form').remove();
    $('#contacts-container').show();
  },
  handleDelete: function(e) {
    e.preventDefault();

    $target = $(e.target);
  },
  handleAdd: function(e) {
    e.preventDefault();

    $('#contacts-container').hide();
    $('main').append(this.templates['form-script']);
  },
  handleEdit: function(e) {
    e.preventDefault();

  },
  handleSubmit: function(e) {
    e.preventDefault();

    this.addContact();
    this.handleCancel(e);
    this.loadContacts();
  },
  loadContacts: function() {
    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/api/contacts');
    xhr.addEventListener('load', function(e) {
      if (xhr.status === 200) {
        self['contacts'] = JSON.parse(xhr.response);
        self.renderContacts();
      } else if (xhr.status === 404) {
        console.log('Error retrieving contacts.');
      }
      console.log('Done processing contacts.');
    });
    xhr.send(); 
  },
  bindEvents: function() {
    this.$main.on('click', '.add-btn', this.handleAdd.bind(this));
    this.$main.on('click', '.edit-btn', this.handleEdit.bind(this));
    this.$main.on('click', '.delete-btn', this.handleDelete.bind(this));
    this.$main.on('click', '.cancel-btn', this.handleCancel.bind(this));
    this.$main.on('click', '.submit-btn', this.handleSubmit.bind(this));

    // $('document').on('keypress', this.handleKeypress.bind(this));
  },
  registerTemplates: function() {
    var self = this;

    $("script[type='text/x-handlebars']").each(function() {
      var $template = $(this);
      var name = $template.attr('id');

      if ($template.data('type') === 'partial') {
        Handlebars.registerPartial(name, $template.html());
      }

      self.templates[name] = Handlebars.compile($template.html());
    });
  },
  init: function() {
    this.registerTemplates();
    this.bindEvents();
    this.loadContacts();
  }
}

App.init();

