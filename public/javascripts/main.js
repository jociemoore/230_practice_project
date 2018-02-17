
var App = {
  $main: $('main'),
  templates: {},
  contacts: [],
  convertBtn: function(e) {
    var id = $(e.target).closest('.contact').data('id');
    $('.submit-btn').addClass('update-btn')
                    .removeClass('submit-btn')
                    .attr('data-id', id);
  },
  filterContacts: function(criteria) {
    return this.contacts.filter(function(contact) {
      var name = contact.full_name;
      return (name.indexOf(criteria)) > -1;
    });
  },
  getMatchingContacts: function() {
    var matchingContacts = this.contacts;

    if (this.matchPhrase) {
      matchingContacts = this.filterContacts(this.matchPhrase);
    }

    return matchingContacts;
  },
  renderNoContacts: function() {
      var $addBtn = $('.add-btn').clone(true);
      var $h3;

      if (this.matchPhrase) {
        $h3 = $('<h3></h3>').text('There are no contacts containing ' + this.matchPhrase + '.');
      } else {
        $h3 = $('<h3></h3>').text('There are no contacts.');
      }
  
      $('#contacts-container').append($h3);
      $('#contacts-container').append($addBtn);
      $('#contacts-container').addClass('empty-contacts-container');
  },
  renderContacts: function(contacts) {
    $('#contacts-container').empty();

    if (contacts.length >= 1) {
      $('#contacts-container').append(this.templates['all-contacts-script']({contacts: contacts}));
      $('#contacts-container').removeClass('empty-contacts-container');
    } else {
      this.renderNoContacts();
    }
  },
  renderErrorMessage: function(msg, $input) {
    var $lastElement = $input.closest('dd').children().last();

    var $el = $('<p>', {
      class: 'error',
      text: msg
    });

    if ($lastElement.is('input')) {
      $input.closest('dd').append($el);
    }
  },
  renderValid: function(input) {
    $(input).removeClass('invalid');

    if ($(input).closest('dd').children().last().is('p')) {
      $(input).closest('dd').find('p').remove();
    }
  },
  renderInvalid: function(input, errorMsg) {
    $(input).addClass('invalid');
    this.renderErrorMessage(errorMsg, $(input));
  },
  validateControl: function(input) {
    var name = $(input).attr('name');
    var errorMsg;

    if (input.validity.valueMissing) {
      errorMsg = 'Please enter the ' + name + ' field.';
      this.renderInvalid(input, errorMsg);
    } else if (input.validity.patternMismatch) {
      errorMsg = 'Please enter a valid ' + name + '.';
      this.renderInvalid(input, errorMsg);
    } else {
      this.renderValid(input);
    }
  },
  validateInputs: function() {
    var self = this;
    $('form input').each(function() {
      self.validateControl(this);
    });
  },
  prefillForm: function(e) {
    var $currentContact = $(e.target).closest('.contact');
    var fullName = $currentContact.find('h3').text(); 
    var email = $currentContact.find('dl dd').last().text();
    var phoneNumber = $currentContact.find('dl dd').first().text();

    this.handleShowForm(e);

    $('form').find("input[name='full_name']").attr('value', fullName);
    $('form').find("input[name='email']").attr('value', email);
    $('form').find("input[name='phone_number']").attr('value', phoneNumber);
  },
  updateContact: function(e) {
    var self = this;
    var id = $('.update-btn').data('id');
    var data = $('form').serialize();
    var xhr = new XMLHttpRequest();

    xhr.open('PUT', '/api/contacts/' + id);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.addEventListener('load', function() {
      if (xhr.readyState === 4 && xhr.status === 201) {
        console.log('Contact info updated successfully.');
        self.handleReturnToHome(e);
        self.loadContacts();
      } else if (xhr.readyState === 4 && xhr.status === 400) {
        console.log('Error updating contact info.');
      }
    });
    xhr.send(data);
  },
  addContact: function(e) {
    var self = this;
    var data = $('form').serialize();
    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/api/contacts');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.addEventListener('load', function() {
      if (xhr.readyState === 4 && xhr.status === 201) {
        console.log('Contact added successfully.');
        self.handleReturnToHome(e);
        self.loadContacts();
      } else if (xhr.readyState === 4 && xhr.status === 400) {
        console.log('Error adding contact.');
      }
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
      if (xhr.readyState === 4 && xhr.status === 204) {
        console.log('Contact deleted successfully.');
        self.loadContacts();
      } else if (xhr.readyState === 4 && xhr.status === 400) {
        console.log('Error deleting contact.');
      }
    });
    xhr.send();
  },
  loadContacts: function() {
    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/api/contacts');
    xhr.addEventListener('load', function(e) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log('Contacts loaded');
        self['contacts'] = JSON.parse(xhr.response);
        self.renderContacts(self.contacts);
      } else if (xhr.readyState === 4 && xhr.status === 404) {
        console.log('Error retrieving contacts.');
      }
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
  handleShowForm: function(e) {
    e.preventDefault();
    $('#contacts-container').hide();
    $('main').append(this.templates['form-script']);
  },
  handleShowUpdateForm: function(e) {
    e.preventDefault();
    this.prefillForm(e);
    this.convertBtn(e);
  },
  handleUpdateContact: function(e) {
    e.preventDefault();

    if ($('form')[0].checkValidity()) {
      this.updateContact(e);
    } else {
      this.validateInputs();
    }
  },
  handleSubmitToAddContact: function(e) {
    e.preventDefault();

    if ($('form')[0].checkValidity()) {
      this.addContact(e);
    } else {
      this.validateInputs();
    }
  },
  handleKeydown: function(e) {
    var $searchbox = $("input[name='search']");
    this.matchPhrase = $searchbox.val();

    if (e.which === 8) {
      this.matchPhrase = this.matchPhrase.slice(0, this.matchPhrase.length - 1);
    }
    
    this.renderContacts(this.getMatchingContacts());
  },
  handleKeypress: function(e) {
    var keyCode = e.which;
    var key = String.fromCharCode(keyCode);

    if (keyCode >= 32 && keyCode <= 126) {
      this.matchPhrase += key;
    } 

    this.renderContacts(this.getMatchingContacts());
  },
  bindEvents: function() {
    this.$main.on('click', '.add-btn', this.handleShowForm.bind(this));
    this.$main.on('click', '.edit-btn', this.handleShowUpdateForm.bind(this));
    this.$main.on('click', '.delete-btn', this.handleDeleteContact.bind(this));
    this.$main.on('click', '.cancel-btn', this.handleReturnToHome.bind(this));
    this.$main.on('click', '.update-btn', this.handleUpdateContact.bind(this));
    this.$main.on('click', '.submit-btn', this.handleSubmitToAddContact.bind(this));
    $("input[name='search']").on('keydown', this.handleKeydown.bind(this));
    $("input[name='search']").on('keypress', this.handleKeypress.bind(this));
    
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

