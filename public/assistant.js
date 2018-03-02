const GoogleAssistant = require('google-assistant-node');
const path = require('path');
const Speaker = require('speaker');
const Microphone = require('mic');
const electron = require('electron');
const fs = require('fs');
const { google: { auth: { OAuth2 } } } = require('googleapis');
const electronGoogleOauth = require('./electron-google-oauth');
const clientSecret = require('./client_secret.json');

const constants = GoogleAssistant.Constants;
const encodings = constants.Encoding;

function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

const tokenStore = path.join(electron.app.getPath('userData'), 'tokens.json');

// setup the speaker
const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 24000,
});

// setup the microphone
const mic = new Microphone({
  rate: '16000',
  channels: '1',
  debug: true,
});

const assistant = new GoogleAssistant({
  input: {
    encoding: encodings.LINEAR16,
    sampleRateHertz: 16000,
  },
  output: {
    encoding: encodings.MP3,
    sampleRateHertz: 16000,
    volumePercentage: 100,
  },
});

assistant.on('ready', conversationStream => {
  console.log('Ready');
  mic.getAudioStream().pipe(conversationStream);
});

assistant.on('audio-data', data => {
  speaker.write(data);
});

assistant.on('response-text', text => {
  console.log('Response Text: ', text);
});

assistant.on('error', err => {
  console.error(err);
  console.log('Error ocurred. Exiting...');
  speaker.end();
  mic.stop();
});

assistant.once('end', () => {
  speaker.end();
  mic.stop();
});

assistant.once('unauthorized', () => {
  console.log('Not authorized. Exiting...');
  speaker.end();
  mic.stop();
});

const speakCallback = assistant => (event, arg) => {
  assistant.converse();
  console.log('speak event');
  speaker
    .on('open', () => {
      console.log('Assistant Speaking');
      event.sender.send('speaking');
      assistant.converse();
    })
    .on('close', () => {
      console.log('Assistant Finished Speaking');
      event.sender.send('spoken');
    });
};

// ======================== //
// Authentication to Google //
// ======================== //

const authClient = new OAuth2(
  clientSecret.installed.client_id,
  clientSecret.installed.client_secret
);

const googleOauth = electronGoogleOauth({
  'use-content-size': true,
  center: true,
  resizable: false,
  'always-on-top': true,
  'standard-window': true,
  'auto-hide-menu-bar': true,
  'node-integration': false,
});

module.exports = async () => {
  const existingToken = parseDataFile(tokenStore);

  if (existingToken) {
    authClient.setCredentials({
      access_token: existingToken.access_token,
      refresh_token: existingToken.refresh_token,
    });

    const token = await new Promise(done =>
      authClient.refreshAccessToken((err, token) => done(token))
    );
    console.log(tokenStore);
    fs.writeFileSync(tokenStore, JSON.stringify(token));
  } else {
    //retrieve access token and refresh token
    const token = await googleOauth.getAccessToken(
      ['https://www.googleapis.com/auth/assistant-sdk-prototype'],
      clientSecret.installed.client_id,
      clientSecret.installed.client_secret
    );

    fs.writeFileSync(tokenStore, JSON.stringify(token));

    authClient.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    });
  }
  assistant.authenticate(authClient);
  return speakCallback(assistant);
};
