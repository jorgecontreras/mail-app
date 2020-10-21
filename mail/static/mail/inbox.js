document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  

  fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        c = "<table class='table'>" +
        "<thead>" +
        "  <tr>" +
        "<th scope='col'></th>" +
        "    <th scope='col'>From</th>" +
        "    <th scope='col'>Subject</th>" +
        "    <th scope='col'>Time</th>" +
        " </tr>" +
        " </thead>" +
        "<tbody>"
        
        emails.forEach(element => {
          if (element.read == true) {
            c += "<tr class='table-active' onclick='view_email(" + element.id + ")'>"
          } else {
            c += "<tr onclick='view_email(" + element.id + ")'>"
          }

          c += "<th scope='row'></th>" +
          "<td>" + element.sender + "</td>" +
          "<td>" + element.subject + "</td>" +
          "<td>" + element.timestamp + "</td>" +
          "</tr>"
          console.log(c)
        });

        c += "</tbody>" 
        c += "</table>" 
        document.querySelector('#emails-view').innerHTML += c 

    });
}

async function archive(id) {
  await fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  });
    
  load_mailbox('inbox')
}

async function unarchive(id) {
  await fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  });
    
  load_mailbox('inbox')
}

function reply(id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email);

        if (email.subject.indexOf("Re: ") >= 0) {
          new_subject = email.subject
        } else {
          new_subject = 'Re: ' + email.subject;
        }
        
        new_body = 'On ' + email.timestamp + ", " + email.sender + " wrote: " + email.body;

        // Prefill composition fields
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = new_subject;
        document.querySelector('#compose-body').value = new_body;

      });

  
}

function view_email(id) {
  console.log("we will show you the email " + id + " now")

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email);

        document.querySelector('#email-view').innerHTML = "<div class='alert-info' role='alert'><h2>" + email.sender + "</h2></h1>"
        document.querySelector('#email-view').innerHTML += "<div class='alert-primary' role='alert'>" + email.recipients + "</div>"
        document.querySelector('#email-view').innerHTML += "<p class='lead'><b>" + email.subject + "</b></p>"
        document.querySelector('#email-view').innerHTML += "<span class='badge badge-pill badge-light'>" + email.timestamp + "</span>"
        document.querySelector('#email-view').innerHTML += "<hr class='my-4'>"
        document.querySelector('#email-view').innerHTML += "<p>" + email.body + "</p>"

        document.querySelector('#email-view').innerHTML += '<button type="button" class="btn btn-primary btn-sm" onclick="reply(' + email.id + ')">Reply</button>&nbsp;&nbsp;&nbsp;'
        
        if(email.archived == false){
          document.querySelector('#email-view').innerHTML += '<button type="button" class="btn btn-secondary btn-sm" onclick="archive(' + email.id + ')">Archive</button>'
        } else {
          document.querySelector('#email-view').innerHTML += '<button type="button" class="btn btn-secondary btn-sm" onclick="unarchive(' + email.id + ')">Unarchive</button>'
        }
        
    });

    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
}

function send_email() {
  console.log("we will submit email")

  subject = document.querySelector('#compose-subject').value
  recipients = document.querySelector('#compose-recipients').value
  body = document.querySelector('#compose-body').value

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
  
  return false
}