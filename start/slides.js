const google = require('googleapis');
const slides = google.slides('v1');
const drive = google.drive('v3');
const openurl = require('openurl');
const commaNumber = require('comma-number');

/**
 * Get a single slide json request
 * @param {object} licenseData data about the license
 * @param {object} index the slide index
 * @return {object} The json for the Slides API
 * @example licenseData: {
 *            "licenseName": "mit",
 *            "percent": "12.5",
 *            "count": "1667029"
 *            license:"<body>"
 *          }
 * @example index: 3
 */
function createSlideJSON(t, index) {
  // Then update the slides.
  const ID_TITLE_SLIDE = 'id_title_slide';
  const ID_TITLE_SLIDE_TITLE = 'id_title_slide_title';
  const ID_TITLE_SLIDE_BODY = 'id_title_slide_body';

  return [{
    // Creates a "TITLE_AND_BODY" slide with objectId references
    createSlide: {
      objectId: `${ID_TITLE_SLIDE}_${index}`,
      slideLayoutReference: {
        predefinedLayout: 'TITLE_AND_BODY'
      },
      placeholderIdMappings: [{
        layoutPlaceholder: {
          type: 'TITLE'
        },
        objectId: `${ID_TITLE_SLIDE_TITLE}_${index}`
      }, {
        layoutPlaceholder: {
          type: 'BODY'
        },
        objectId: `${ID_TITLE_SLIDE_BODY}_${index}`
      }]
    }
  }, {
    // Inserts the question body
    insertText: {
      objectId: `${ID_TITLE_SLIDE_TITLE}_${index}`,
      text: t
    }
  }];
}

module.exports.createSlides = (authAndGHData) => new Promise((resolve, reject) => {
  console.log('creating slides...');
  const [auth, data] = authAndGHData;

  const slideTitleText = `Countdown Round ${data.year} ${data.level}`

  // First copy the template slide from drive.
  drive.files.copy({
    auth: auth,
    fileId: '1Y6HeFk2Cr-XFTb7_cEahJmVJ-OLQWrjp4UMLwr8fcbY',
    fields: 'id,name,webViewLink',
    resource: {
      name: slideTitleText
    }
  }, (err, presentation) => {
    if (err) return reject(err);

    const allSlides = data.questions.map((question, index) => createSlideJSON(question, index));
    slideRequests = [].concat.apply([], allSlides); // flatten the slide requests
    slideRequests.push({
      replaceAllText: {
        replaceText: slideTitleText,
        containsText: { text: '{{TITLE}}' }
      }
    })

    // Execute the requests
    slides.presentations.batchUpdate({
      auth: auth,
      presentationId: presentation.id,
      resource: {
        requests: slideRequests
      }
    }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(presentation);
      }
    });
  });
});

/**
 * Opens a presentation in a browser.
 * @param {String} presentation The presentation object.
 */
module.exports.openSlidesInBrowser = (presentation) => {
  console.log('Presentation URL:', presentation.webViewLink);
  openurl.open(presentation.webViewLink);
}
