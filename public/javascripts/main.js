
var App = {
  $main: $('main'),
  templates: {},
  contacts: [],
  tags: [],
  getAllTags: function() {
    var tagInputs = $("input[name='tag']:checked");
    var tags = '';

    tagInputs.each(function(_, input) {
      tags += input.value + ',';
    });

    return tags;
  },
  serializeData: function() {
    var inputs = $('form').find('input[name]');
    var keysAndValues = [];

    for (var i = 0; i < inputs.length; i += 1) {
      var input = inputs[i];
      var key = encodeURIComponent(input.name);
      var value;

      if (key !== 'tag') {
        value = encodeURIComponent(input.value);
        keysAndValues.push(key + '=' + value);
      }
    }

    keysAndValues.push('tags=' + this.getAllTags());
    return keysAndValues.join('&');
  },
  convertBtn: function(e) {
    var id = $(e.target).closest('.contact').data('id');
    $('.submit-btn').addClass('update-btn')
                    .removeClass('submit-btn')
                    .attr('data-id', id);
  },
  filterContactsByName: function(criteria) {
    return this.contacts.filter(function(contact) {
      var name = contact.full_name;
      return (name.indexOf(criteria)) > -1;
    });
  },
  getMatchingContactsByLetter: function() {
    var matchingContacts = this.contacts;

    if (this.matchPhrase) {
      matchingContacts = this.filterContactsByName(this.matchPhrase);
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
  renderTags: function() {
    $('#tags-container').empty();
    $('#tags-container').append(this.templates['all-tags-script']({tags: this.tags}));
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
    var name = $(input).attr('name').split('_').join(' ');
    var errorMsg;

    if (input.validity.valueMissing) {
      errorMsg = 'Please enter a ' + name + '.';
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
  precheckTags: function($currentContact) {
    var $contactTags = $currentContact.find('.contacts-tag-container').find('a');
    
    $contactTags.each(function(_, tag) {
      var value = $(tag).text();
      $('form').find('input[value=' + value + ']').attr('checked', true);
    });
  },
  prefillForm: function(e) {
    var $currentContact = $(e.target).closest('.contact');
    var fullName = $currentContact.find('h3').text(); 
    var email = $currentContact.find('dl dd').last().text();
    var phoneNumber = $currentContact.find('dl dd').first().text();

    this.handleShowNewForm(e);
    $('form').find("input[name='full_name']").attr('value', fullName);
    $('form').find("input[name='email']").attr('value', email);
    $('form').find("input[name='phone_number']").attr('value', phoneNumber);
    this.precheckTags($currentContact);
  },
  updateContact: function(e) {
    var self = this;
    var id = $('.update-btn').data('id');
    var data = this.serializeData();
    console.log(data)
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
    var data = this.serializeData();
    console.log(data)
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
        self.handleTagData();
        self.renderContacts(self.contacts);
      } else if (xhr.readyState === 4 && xhr.status === 404) {
        console.log('Error retrieving contacts.');
      }
    });
    xhr.send(); 
  },
  handleTagData: function() {
    var self = this;

    this.contacts.forEach(function(contact){
      contact.tags = contact.tags.split(',')
      contact.tags.splice(contact.tags.length - 1, 1);
      uniqueTags = contact.tags.filter(function(tag, index) {
        return self.tags.indexOf(tag) === -1;
      });
      self.tags = $.merge(self.tags, uniqueTags);
    });
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
  handleShowNewForm: function(e) {
    e.preventDefault();
    $('#contacts-container').hide();
    $('main').append(this.templates['form-script']);
    this.renderTags();
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
    
    this.renderContacts(this.getMatchingContactsByLetter());
  },
  handleKeypress: function(e) {
    var keyCode = e.which;
    var key = String.fromCharCode(keyCode);

    if (keyCode >= 32 && keyCode <= 126) {
      this.matchPhrase += key;
    } 

    this.renderContacts(this.getMatchingContactsByLetter());
  },
  handleCreateTag: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var $newTagInput = $target.closest('dd').children().first();
    var newTag = $newTagInput.val();

    this.tags.push(newTag);
    $newTagInput.val('');
    this.renderTags();
  },
  handleSortByTag: function(e) {
    e.preventDefault();
    var matchTag = $(e.target).text();
    var matchingContactsByTag = this.contacts.filter(function(contact) {
      return contact.tags.includes(matchTag);
    });

    this.renderContacts(matchingContactsByTag);
  },
  bindEvents: function() {
    this.$main
      .on('click', '.add-btn', this.handleShowNewForm.bind(this))
      .on('click', '.edit-btn', this.handleShowUpdateForm.bind(this))
      .on('click', '.delete-btn', this.handleDeleteContact.bind(this))
      .on('click', '.cancel-btn', this.handleReturnToHome.bind(this))
      .on('click', '.update-btn', this.handleUpdateContact.bind(this))
      .on('click', '.submit-btn', this.handleSubmitToAddContact.bind(this))
      .on('click', '.create-tag-btn', this.handleCreateTag.bind(this))
      .on('click', '.tag', this.handleSortByTag.bind(this));

    $("input[name='search']")
      .on('keydown', this.handleKeydown.bind(this))
      .on('keypress', this.handleKeypress.bind(this));
    
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

