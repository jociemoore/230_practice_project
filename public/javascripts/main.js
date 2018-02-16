var contacts = [
  // {id:1, full_name:'Joe Smoe', email:'joe@smoe.com', phone_number:'111-222-3333', tags:'work, friend'},
  // {id:2, full_name:'Tina Franklin', email:'tina@franklin.com', phone_number:'555-555-5555', tags:'daughter'},
  // {id:3, full_name:'Reese Winter', email:'reese@winter.com', phone_number:'888-888-9999', tags:'coach'},
  // {id:4, full_name:'Sam Wise', email:'sam@wise.com', phone_number:'222-222-222', tags:'gardener'},
  // {id:5, full_name:'Jarvis', email:'Jarvis@me.com', phone_number:'123-123-1234', tags:'caretaker'},
]

var App = {
  templates: {},
  contacts: contacts,
  renderContacts: function() {
    $('#contacts-container').append(this.templates['all-contacts-script']({contacts: this.contacts}));
    $('#contacts-container').removeClass('empty-contacts-container');
  },
  renderNoContacts: function() {

  },
  handleContacts: function() {
    if (contacts.length >= 1) {
      this.renderContacts();
    } else {
      this.renderNoContacts();
    }
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
    this.handleContacts();
  }
}

App.init();

