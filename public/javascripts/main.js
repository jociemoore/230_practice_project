
var App = {
  $main: $('main'),
  templates: {},
  contacts: [],
  renderContacts: function() {
    $('#contacts-container').empty();

    if (this.contacts.length >= 1) {
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
  addContact: function(e) {
    var self = this;
    var data = $('form').serialize();
    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/api/contacts');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.addEventListener('load', function() {
      if (xhr.status === 201) {
        console.log('Contact added successfully.');
        self.handleReturnToHome(e);
        self.loadContacts();
      } else if (xhr.status === 400) {
        console.log('Error adding contact.');
      }
      console.log('Done adding contact.');
    });
    xhr.send(data);
  },
  deleteContact: function(e) {
    var $target = $(e.target);
    var xhr = new XMLHttpRequest();
    var id = $target.closest('.contact').data('id');
    var self = this;

    xhr.open('DELETE', '/api/contacts/' + id);
    xhr.addEventListener('load', function() {
      if (xhr.status === 204) {
        console.log('SUCCESS deleting contact.');
        self.loadContacts();
      } else if (xhr.status === 400) {
        console.log('Error deleting contact.');
      }
      console.log('Done deleting contact.');
    });
    xhr.send();
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
  handleReturnToHome: function(e) {
    e.preventDefault();
    $('form').remove();
    $('#contacts-container').show();
  },
  handleDeleteContact: function(e) {
    e.preventDefault();
    var isDeleteConfirm = confirm('Do you want to delete the contact?');
    if (isDeleteConfirm) {
      this.deleteContact(e);
    }
  },
  handleAddBtnClick: function(e) {
    e.preventDefault();
    $('#contacts-container').hide();
    $('main').append(this.templates['form-script']);
  },
  handleEditContact: function(e) {
    e.preventDefault();
    // put handlebars into form as placeholders
    // get current contact
    // pass this context to form 
    // show form
    // update sumbit with a PUT

  },
  handleSubmitToAddContact: function(e) {
    e.preventDefault();
    this.addContact(e);
  },
  bindEvents: function() {
    this.$main.on('click', '.add-btn', this.handleAddBtnClick.bind(this));
    this.$main.on('click', '.edit-btn', this.handleEditContact.bind(this));
    this.$main.on('click', '.delete-btn', this.handleDeleteContact.bind(this));
    this.$main.on('click', '.cancel-btn', this.handleReturnToHome.bind(this));
    this.$main.on('click', '.submit-btn', this.handleSubmitToAddContact.bind(this));

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

