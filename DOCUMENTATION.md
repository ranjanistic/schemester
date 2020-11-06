# Schemester Devs

This doc explains the objects, methods, developement &amp; testing cycle of schemester.

## Local Setup

The [README](README.md) explains basic setup for beginning local server run.
This doc doesn't particularly deal with that, so have a look at it.
The rough steps however, are following.

```bash
git clone https://github.com/ranjanistic/schemester-web.git
git branch branch-name  #name your own branch if you don't want to work on any existing branches
git checkout branch-name
npm install
npm run devserver
```

This should start your local server on https, and following log must be visible (if [these steps](README.md#generate-locahost-certificate) were followed for the first time).

```bash
Connected to schemesterDB
listening on 3000 (https)
```

## Familiarization

### Briefing

The schemester web application follows a class based programming pattern. Several script files, on client as well as server side, work interactively and together.

### Spine Scripts

Some scripts are central to the application, and thus it is important to understand those first.

#### [codes.js](public/script/codes.js)

This script file _maintains communicable objects between client and server, and among client and server themselves, ensuring uniformity & preciseness in event reporting, and apart from that, some shareable methods too._

In short, this script file is shared between client &amp; server, and used among both. All client pages must load this file before loading any other files, if other separate scripts are to be used.

The script provides the following.

##### String Codes

String codes, classfied in separate classes, are used to ensure a precise communication between server and client.
Along with the usual http codes, the server sends specific codes from this file to ensure that client request receives and understands the response, and then act accordingly to the received code.

The following is one of the sub-classes of codes class from this script file.

- Snippet

```js
class Codes{
    constructor(){
      ...
      class VerificationCodes {
        constructor() {
          this.LINK_GENERATED = "verify/link-generated";
          this.LINK_VALID = "verify/link-is-valid";
          this.LINK_EXPIRED = "verify/link-is-expired";
          this.LINK_INVALID = "verify/invalid-illegal-link";
          this.VERIFIED = "verify/verification-success";
          this.NOT_VERIFIED = "verify/verification-failed";
        }
      }
      const verify = new VerficationCodes();
      ...
    }
}
const code = new Codes();
```

The above class is subclass of _Codes_ class in the script, used for verification related communication between client &amp; server.

- Usage

```js
//server
res.json({event:code.verify.VERIFIED});

//client
if(response.event == code.verify.VERIFIED)
    alert("Verified!");
```

##### Constants

Constant values, throughout the application, are used to maintain uniformity in several calculations, reduce clashes client-server values.
For example,

- Snippet

```js
class Constant {
  constructor() {
    this.appName = "Schemester";
    this.fetchContentType = "application/x-www-form-urlencoded; charset=UTF-8";
    this.fetchJsonContent = "application/json";
    ...
  }
}
const constant = new Constant();
```

The above snippet shows few objects among serveral others in _Constant_ class of the script. Objects like these are uniform for client and server.

- Usage

```js
>>console.log(`This is ${constant.appname}`)
>>This is Schemester
```

##### Client

The three clients of this app are encoded in string format as variables of this class.

- Snippet

```js
class Client {
  constructor() {
    this.admin = "admin";
    this.teacher = "teacher";
    this.student = "student";
  }
}
const client = new Client();
```

The objects of this class are used in several other methods and classes to ensure uniformity in naming of the client types.

- Usage

```js
//server
if(req.client === client.admin)
    showSensitiveData();
else
    return false;
```

##### Locations

The endpoints of GET requests made by client are also shared, and therefore, the _Locations_ class of this script maintains objects holding string values of server endpoints.

- Snippet

```js
class Locations {
  constructor() {
    this.homepage = "/home";
    this.offline = "/offline";
    this.root = "/";
    this.planspage = "/plans";
    ...
  }
}
const locate = new Locations();
```

The objects of this class are shared with server and client, thus ensuring no typo in GET request endpoint string. This class also holds request query parameters for individual client types, sent along with requests.

- Usage

```js
//client
window.location.href = locate.homepage
//refers to homepage
```

##### Views

Provides file paths to the server to render selectively. Usually not required by client. This avoids harcoding of filenames/paths in rendering code.

- Snippet

```js
class View {
  constructor() {
    this.homepage = "home.ejs";
    this.loader = "loader.ejs";
    this.plans = "plans.ejs";
    this.notfound = "404.ejs";
    this.servererror = "500.ejs";
    this.forbidden = "403.ejs";
    this.offline = "offline.ejs";
    ...
  }
}
const view = new View();
```

- Usage

```js
//server
if(req.query.isvalid)
    res.render(view.homepage)
else res.render(view.notfound);
```

##### Post endpoints

Like _Locations_ class, _Posts_ class contains POST request endpoint strings, for client to request and server to receive.

- Snippet

```js
class Posts {
  constructor() {
    this.logout = "/logout";
    ...
  }
}
const post = new Posts();
```

Snippet shows a logout string object, likely to be used to send a logout post request to the server, irrespective of client.

- Usage

```js
//client
postJsonData(post.logout,{
    client:client.student
}).then(response=>{
    if(response.event == code.OK)
        window.parent.location.reload();
    else alert("Failed to logout");
});
//postJsonData method uses fetch API; is defined in main.js

```

The other details can be sent along with this string in JSON format using [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API), as we'll see in [main.js](#mainjspublicscriptmainjs) methods.

##### Keys

This script also maintains the keys for client side local/session storage key value pairs, defined in variables of _Keys_ class.

- Snippet

```js
class Keys {
  constructor() {
    this.uiid = "uiid";
    this.email = "email";
    this.dark = "dark";
    this.light = "light";
    this.theme = "theme";
    ...
  }
}

const key = new Keys();
```

- Usage

```js
//client
let theme = localStorage.getItem(key.theme);
```

##### Theme

Methods for application theme are defined in class _Theme_ of this script. Used by client.

- Snippet

```js
class Theme {
  constructor() {
    this.dark = key.dark;
    this.light = key.light;
    this.key = key.theme;
    ...
  }
  switch() {
    this.isLight() ? this.setDark() : this.setLight();
  }
  ...
}
const theme = new Theme();
```

As it is visible, the variables of this class take values from object of [Keys](#keys) class of this script.

- Usage

```js
  //client
 someswitchbutton.onchange=_=>theme.switch();
```

##### Input Types

Custom input types for html input validation and other purposes are defined in variables of _InputType_ class in the script.

- Snippet

```js
class InputType {
  constructor() {
    this.name = "name";
    this.email = "email";
    ...
    this.wholenumber = "nonnegative";
    this.weekday = "weekday";
    ...
  }
}

const validType = new InputType();
```

The custom types are generally used in input validation methods, client side most of time. A common validation method is [stringIsValid](#stringisvalidstringinputtypeobjectstring).

- Usage

```js
const stringIsValid = (
  value = String,
  type = validType.nonempty,
  ifMatchValue = String
) => {
  switch (type) {
    ...
    case validType.email:
      return constant.emailRegex.test(String(value).toLowerCase());
    ...
  }
}
```

Here ```constant``` is an object of [Constants](#constants) class.

##### View type

The variables of _ViewType_ class contain basic types of views, or emotions to be used to set html element styles accordingly, like setting background red for negative, white for neutral, etc.

This class also has methods to return styles according to given view type, of elements used throughout the application, like buttons, switches, or input fields, which can later be used to set CSS class of that element, according to given viewtype.

- Snippet

```js
class ViewType {
  constructor() {
    this.neutral = "neutral";
    this.positive = "positive";
    this.negative = "negative";
    ...
  }
  ...
  getSwitchStyle(type) {
    switch (type) {
      case this.positive: return "switch-positive"; //these names are defined
      case this.negative: return "switch-negative"; //in main.css stylesheet.
      ...
    }
  }
  ...
}
const viewType = new ViewType();
const actionType = new ViewType();
const bodyType = new ViewType();
```

- Usage

```js
//client
...
setViewType(aSwitchElement,view){  
  setClassNames(aSwitchElement, actionType.getSwitchStyle(view));
}
...
```
The method _setClassNames_ is defined [here](#setclassnames).

Here the parameter _view_ is a variable of [ViewType](#view-type) class, could be ViewType.neutral, or anything. The actionType object calls getSwtchStyle method of _ViewType_ class, to get the appropriate CSS class (from [main.css](#maincsspubliccssmaincss)) for given switch element, which is then used by [setClassNames](#setclassnames) method (defined in [main.js](#mainjspublicscriptmainjs)) to set it.

##### Colors

The _Colors_ class variables contain color variable names from main.css, to be used to assign colors to elements. The method _getColorByType_ returns appropriate color variable, according to the provided [ViewType](#view-type) class variable as parameter.

- Snippet

```js
class Colors {
  constructor() {
    this.positive = "var(--positive)";  //these variables are defined
    this.negative = "var(--negative)";  //in main.css stylesheet
    ...
    this.white = "#ffffff";
    this.black = "#000000";
    ...
  }
  getColorByType(type) {
    switch (type) {
      case actionType.positive:
        return this.positive;
      case actionType.negative:
        return this.negative;
      ...
    }
  }
}
const colors = new Colors();
```

- Usage

```js
  someElement.style.backgroundColor = colors.getColorByType(actionType.negative);
```

##### Methods

The following are the methods defined in this script, which are used by both client and server, and are safe to expose publicly.

###### stringIsValid(String,InputType.object,String)

This method uses variables of [InputType](#input-types) class to check against provided input type (which itself is pass via InputType class), and returns boolean if the given string is valid or not, as per the given type.

- Snippet

```js
const stringIsValid = (
  value = String,
  type = validType.nonempty,
  ifMatchValue = String
) => {
  switch (type) {
    ...
    case validType.email:
      return constant.emailRegex.test(String(value).toLowerCase());
    ...
  }
}
```

- Usage

```js
//valid string
> var valid = stringIsValid("sunday",validType.weekday)
> console.log(valid)
> true
//invalid string
> valid = stringIsValid("blahblah",validType.weekday)
> console.log(valid)
> false
```

##### Footnote

This script should contain the objects and methods which are to be shared between client and server, and are safe to be exposed to client.

- _The class [Codes](#codesjspublicscriptcodesjs) can always be extended to contain more variables and subclasses as per the needs._

- _The objects of defined classes in the script are actually defined at the end of script, not the way shown in the snippets here for explanatory purposes._

- _To ensure that both client and server are able to use this script, a try-catch block is placed at the end of script. The try contains module.exports method, used by server to receive the exported objects and methods. The catch block catches the error thrown by client side because of module.exports in try block._

#### [main.js](public/script/main.js)

This file maintains the classes and methods to be used by client side, defining the boilerplate and repetitive codes, so that the other scripts do not have to be filled with the same, with classes for custom made elements which provide useful methods for direct utilization of large code pieces, shortening the code length in other scripts.

The following classes and methods are included in this script.

##### Button

```js
class Button{
  constructor(buttonid,actiontype=actionType.positive){
    this.button = getElement(buttonid);
    setClassNames(this.button,actionType.getButtonStyle(actiontype));
  }
  ...
}
```

This initializes button element, and the actiontype parameter is a variable of [ViewType](#view-type) class. Defaults to ViewType().positive, sets button class accordingly.
Provides methods to set type, enable, disable button.

##### DialogID

This class containes variables to which default ids are assigned. This class is not to be used directly unless actually needed, because the [Dialog](#dialog) class itself has plenty of methods for most of the requirements.

##### Dialog

This class manages formation of dialog boxes throughout the application, with the help of [DialogID](#dialogid) class to grab the basic html for dialog box included in all view files where dialog boxes are required, which is

```html
<div id="dialogView" class="dialog fmt-animate-opacity">
  <div class="dialog-box container fmt-row fmt-animate-left" id="dialogBox">
  </div>
</div>
```

This html code is to be included at the bottom of ```<body>``` in the views wherever dialog box is required, else the [Dialog](#dialog) class will throw error.

This class provides several methods to create multiple inputs fields, actions, set image, heading, subheading, background, show, hide etc., and input validation methods using [TextInput](#textinput) class.

To create a simple dialog, in the script file type

```js
 const simpledialog = new Dialog(); //initializes a dialog, so the html part must be in the file, or will throw error here.
 simpledialog.setDisplay("A heading","Detailed text","optional/image/source");
 simpledialog.createActions(['Action 1','Action 2'],[actionType.positive,actionType.neutral]);
 simpledialog.onButtonClick([
   _=>{},
   _=>{}
 ]); //Array of functions to assign to actions created in previous line.
 simpledialog.show();
```

This creates a basic dialog without inputs, and similarly other methods of this class can be called to create complex dialog boxes.

##### Editable

This class manages editable text view, which can be used to display a text and provide user an option to edit the displayed text.

```js
class Editable{
  constructor(viewID,editviewID,textInput = new TextInput(),editID,viewText,saveID,cancelID,loaderID = null){
    ...
  }
  ...
}
```

The constructor takes a good amount of parameters, to properly make the editable view work, for which the basic html goes like

```html
<!-- viewer part is default one. The editor part comes into play when editbutton is clicked. This is handled by Editable class -->
<div class="positive" id="viewer">
    <span id="textview">Text View</span>
    <button class="neutral-button caption" id="editbutton">Edit</button>
</div>
<div id="editor">
  <!-- The fieldset block comes from TextInput class's basic html code, therefore this depends on TextInput class -->
  <fieldset style="margin:0" class="text-field questrial" id="textfield">
    <legend class="field-caption">A Caption</legend>
    <input class="text-input" type="text" id="textinput">
    <span class="fmt-right error-caption"  id="texterror"></span>
  </fieldset>
  <!-- These buttons handle the fortune of input text and editor view, for which methods are provided in Editable class -->
  <button class="positive-button caption" id="saveinput">Save</button>
  <button class="negative-button caption" id="cancelinput">Cancel</button>
  <!-- Optional: a small loader, already rotating -->

</div>
```

A bit too much to write, but does the job perfectly fine, Editable with all its child methods. To use it in a script,

```js
  const textinput = new TextInput("textfield","textinput","texterror",validType.nonempty);
  const editable = new Editable("viewer","editor",textinput,"editbutton","textview","saveinput","cancelinput"); //this will hide editor view by default, and show textview, plus, will assign editbutton to show editor and hide viewer.
  editor.onSave(_=>{});
  editor.onCancel(_=>{});
```

Other methods can also be used to customize the input, validate or get the input value, disable,enable input, etc.

##### Menu

This class controls menu view in html view.

```js
class Menu{
  constructor(menuID,toggleID){
    ...
  }
  ...
}
```

Has few methods, to show and hide. Uses ```toggleID``` as a button to show or hide menu view of id ```menuID```.

```js
 const simplemenu = new Menu("simplemenuview","simplemenutoggle");
```

##### Snackbar

Shows a small message at bottom left of screen.

```js
class Snackbar {
  id = "snackBar";
  textId = "snackText";
  buttonId = "snackButton";
  constructor() {
    ...
  }
}
```

For this to work, a small html code is required at the end of ```<body>```, just like [Dialog](#dialog) class.

```html
<div id="snackBar" class="snack-positive fmt-animate-bottom">
  <span class="fmt-left fmt-padding" id="snackText"></span>
  <button class="fmt-right neutral-button" id="snackButton"><button>
</div>
```

Paste this html in the view where you need the [Snackbar](#snackbar) class to work. Then in your script,

```js
const snack = new Snackbar();

snack.createSnack("A small message",bodyType.positive);
snack.show();
```

Alternatively, [snackBar](#snackbarstringstringactiontypefunction) method is cleaner, and just needs to be called for a snackbar.

##### Switch

This handles the customized switch input view object. Has several methods to assign or dynamicize switch properties and actions.

```js
class Switch{
  constructor(switchID,switchTextID,switchViewID,switchContainerID,viewType = bodyType.positive){
    ...
  }
  ...
}
```

The constructor initalizes switch view, and the html code with script object creation has already been [explained here](#switchcsspubliccssswitchcss).

##### TextInput

This class controlls custom text input view, and provides methods for serveral actions like validation, getting value, showing error by changing color, etc. This class is also a supporting class for other classes like [Editable](#editable) and [Dialog](#dialog), as they require input fields for their own methods, depending on this class.

```js
class TextInput {
  constructor(
    fieldId = String(),
    inputId = String(),
    errorId = String(),
    type = null,
    captionId = null
  ) {
    ...
  }
  ...
}
```

For this to initialize and work, the following piece of html code is required to be put in view file.

```html
<fieldset class="text-field" id="textfield">
  <legend class="field-caption" id="textcaption">A Caption</legend>
  <input class="text-input" type="text" id="textinput">
  <span class="fmt-right error-caption"  id="texterror"></span>
</fieldset>
```

This has to be put wherever an input field is required. Then every input field can be assigned to an object in script like so

```js
  const textinput = new TextInput("textfield","textinput","texterror",validType.nonempty,"textcaption");
```

Last two parameters are optional, however, become necessary if any method requiring them is called, like

```js
if(!textinput.isValid())
  textinput.validateNow();  //this requires the type parameter to validate.
textinput.setFieldCaption("A new caption"); //this requires the captionID parameter to set.
```

_Note: For all the above element controller classes to work, [main.css](#maincsspubliccssmaincss) & [fmt.css](#fmtcsspubliccssfmtcss) files are neccessary (& [switch.css](#switchcsspubliccsswitchcss) for [Switch](#switch) class]. Otherwise the methods or even the initialization could/will fail and throw errors._

##### [Methods](#mainjsmethod)

###### addNumberSuffixHTML

###### getElement

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()

###### addNumberSuffixHTML()


### Spine Styles

#### [main.css](public/css/main.css)

The main stylesheet for schemester, throughout application, mandatory for every view.

#### [fmt.css](public/css/fmt.css)

This stylesheet is a modified version of [w3.css](https://www.w3schools.com/w3css/4/w3.css), thus the documentation is same as of [w3.css documentation](https://www.w3schools.com/w3css/defaulT.asp), and can be referred. Throughout application, mandatory for every view.

```css
/* In w3.css */
.w3-hover-blue{
  ...
}

/* In fmt-css */
.fmt-hover-blue{
  ...
}
```

#### [switch.css](public/css/switch.css)

The stylesheet for switch element, to be included if custom switch element is to be used, which is like following.

```html
<label class="switch-container" id="switchcontainer">
  <label for="switch" id="switchlabel">Some Switch</label>
  <input type="checkbox" id="switch" />
  <span class="switch-positive" id="switchview"></span>
</label>
```

This html code can be grabbed easily using [Switch](#switch) class defined in [main.js](#mainjspublicscriptmainjs).

```js
const someswitch = new Switch("switch","switchlabel","switchview","switchcontainer",bodyType.positive);
```

Here ```bodyType``` is an object of [ViewType](#view-type) class.

The ```switch-positive``` class can be altered with other similar classes from this stylesheet, or using ```setViewType``` method from [Switch](#switch) class.

```js
//sets switch-negative class.
someswitch.setViewType(bodyType.negative);
```

### Directory Setup

The directories in project have been set meaningfully. Following are the directories and thier contents, beginning from root.

#### config/

This folder contains configuration files for server. The contents are following.

##### config.json

Contains keys and values for configuration, including secret keys.

##### [db.js](config/db.js)

This script is called in [server.js](#serverjs) to connect to cloud Mongo DB Atlas. The credentials are taken from [config.json](#configjson).

##### [pusher.js](config/pusher.js)

Connects and exports the pusher class object, to be called wherever connection with pusher is required.

#### public/

This folder contains public files, to be served and used on client side. The contents and sub-folders are following.

##### [css/](public/css)

This contains stylesheets for the webapp. The stylesheets have already been [discussed here](#spine-styles).

```html
<link href="/font/fmt.css" rel="stylesheet">
<link href="/css/main.css" rel="stylesheet">
<!-- Optionally -->
<link href="/css/switch.css" rel="stylesheet">
```

##### [font/](public/font)

This contains fonts stylesheets for the application. These fonts are included in header of all views as stylesheets.

- [Jost.css](public/font/Jost.css)

- [Questrial.css](public/font/Questrial.css)

```html
<link href="/font/Jost.css" rel="stylesheet">
<link href="/font/Questrial.css" rel="stylesheet">
```

##### [graphic/](public/graphic)

The contents of this folder are organized for and contain vector as well as raster graphics. The following are the sub-folders.

- [elements/](public/graphic/elements)

- [icons/](public/graphic/icons)

- [illustrations/](public/graphic/illustrations)

```html
<img src="/graphic/icons/schemester512.svg" width="50%" alt="Schemester Icon"/>
```

```html
<!-- Header -->
<link
  rel="icon"
  href="/graphic/icons/schemester128.png"
  type="image/png"
  sizes="128x128"
/>
```

_Apart from the above categories, some unorganized vector graphics are also stored in [graphic](#graphicpublicgraphic) folder._

##### [script/](public/script)

This folder contains client sided scripts (including the shared script [codes.js](#codesjspublicscriptcodesjs)), and sub-folders for specific categories of scripts grouped by [client type](#client) and common features.

The subfolders are following.

###### admin/

The scripts in this folder are for admin views.

- [admin.js](public/script/admin/admin.js) for common methods among all admin scripts.
- [adminDash.js](public/script/admin/adminDash.js) for dashboard view of admin.
- [adminlogin.js](public/script/admin/adminlogin.js) for login view.
- [management.js](public/script/admin/management.js) for settings view.
- [register.js](public/script/admin/register.js) for registration view.
- [schedule.js](public/script/admin/schedule.js) for individual schedule view.
- [teacherfiller.js](public/script/admin/teacherfiller.js) for teacher filling view of admin and teacher (decided by [client type](#client) and other conditions).
- [users.js](public/script/admin/users.js) for users view.

###### comms/

The scripts in this folder are for communication views common to all clients.

- [calling.js](public/script/comms/calling.js) for calling view
- [chatroom.js](public/script/comms/chatroom.js) for chatting view
- [comms.js](public/script/comms/comms.js) for main communication view

###### student/

The scripts in this folder are for student views.

- **fragment/** This folder contains scripts for fragment views of student.
  - [about.js](public/script/student/fragment/about.js) for about a.k.a. settings fragment view
  - [classroom.js](public/script/student/fragment/classroom.js) for classroom
  - [fullweek.js](public/script/student/fragment/fullweek.js) for full schedule
  - [today.js](public/script/student/fragment/today.js) for today's schedule

- [student.js](public/script/student/student.js) for common methods among student scripts
- [studentdash.js](public/script/student/studentdash.js) for dashboard view (parent of fragments)
- [studentlogin.js](public/script/student/studentlogin.js) for login view.

###### teacher/

The scripts in this folder are for teacher views.

- **fragment/** This folder contains scripts for fragment views of teacher.
  - [about.js](public/script/teacher/fragment/about.js) for about a.k.a. settings fragment view
  - [classroom.js](public/script/teacher/fragment/classroom.js) for classroom
  - [fullweek.js](public/script/teacher/fragment/fullweek.js) for full schedule
  - [today.js](public/script/teacher/fragment/today.js) for today's schedule

- [teacher.js](public/script/teacher/teacher.js) for common methods among teacher scripts
- [teacherdash.js](public/script/teacher/teacherdash.js) for dashboard view (parent of fragments)
- [teacherlogin.js](public/script/teacher/teacherlogin.js) for login view.

_The following scripts do not fall under sub-categories, and thus are directly under the parent folder._

###### [codes.js](#codesjspublicscriptcodesjs)

This script has already been [discussed here](#codesjspublicscriptcodesjs).

###### [device.js](public/script/device.js)

To handle client device related operations, like handling hardware permissions. The tasks requiring hardware permissions must use methods of this script to smoothly process the permission management and further execution if or if not granted.

###### [homepage.js](public/script/homepage.js)

For homepage view, handles recent login tab view and other things.

###### [invitation.js](public/script/invitation.js)

For invitation view, handles login/signup client view via invite link.

###### [localDB.js](public/script/localDB.js)

To handle and manage local database (indexed DB) operations when required.

###### [main.js](#mainjspublicscriptmainjs)

This script has already been [discussed here](#mainjspublicscriptmainjs).

###### [pwacompat.js](public/script/pwacompat.js)

To support pwa procedure. More info can be found [here](https://developers.google.com/web/updates/2018/07/pwacompat). The script is taken from [here](https://unpkg.com/pwacompat).

###### [resetpassword.js](public/script/resetpassword.js)

For password reset view, handles password reset view via link for all [clients](#client).

###### [qrcode.js](public/script/qrcode.js)

For generation of qrcode for links of invitation, to be used only where required. This script is originally taken from [here](https://davidshimjs.github.io/qrcodejs/).

###### [verification.js](public/script/verification.js)

For verification view, handles verification client view for all [clients](#client).

_Few more scripts are there in public/script directory, but not yet ready for documentation, therefore not included yet._

##### [manifest.json](public/manifest.json)

This is required for the purpose of generation of PWA, along with the [service worker](#swjspublicswjs) script.

##### [sw.js](public/sw.js)

This is the service worker script responsible for offline and cache management, particularly for succession of PWA, along with the [manifest.json](#manifestjsonpublicmanifestjson).

#### routes/

This folder contains the route files of server, routed on the base of [client types](#client) of this application. The following files handle the separate routes from [server](#serverjs) file, where the route names are taken from [Client](#client) class.

- [admin.js](routes/admin.js) This handles all requests made for admin route.
- [teacher.js](routes/teacher.js) This handles all requests made for teacher route.
- [student.js](routes/student.js) This handles all requests made for student route.

#### views/

This folder contains sub-folders and files of the same structure as of [script/](#scriptpublicscript) folder, containing views (ejs) for the application, rendered by server and routers.

The subfolders are following.

##### admin/

The views in this folder are for admin routes.

- [admin.ejs](views/admin/admin.ejs) for common methods among all admin views.
- [admin_dash.ejs](views/admin/admin_dash.ejs) for dashboard view of admin.
- [admin_login.ejs](views/admin/admin_login.ejs) for login view.
- [management.ejs](views/admin/management.ejs) for settings view.
- [edit_detail.ejs](views/admin/register.ejs) for registration/editing details view.
- [schedule_view.ejs](views/admin/schedule_view.ejs) for individual schedule view.
- [teacherfiller.ejs](views/admin/teacherfiller.ejs) for teacher filling view of admin and teacher (decided by [client type](#client) and other conditions).
- [users.ejs](views/admin/users.ejs) for users view.

##### comms/

The views in this folder are rendered by communication methods of each route.

- [calling.ejs](views/comms/calling.ejs) for calling view
- [chatroom.ejs](views/comms/chatroom.ejs) for chatting view
- [comms.ejs](views/comms/comms.ejs) for main communication view

##### mail/

The views in this folder are loaded by [mailer worker](#workers). Not meant for webpage rendering by server, but to send emails.

- [invitation.ejs](views/mail/invitation.ejs) for invitation template
- [passreset.ejs](views/mail/passreset.ejs) for password reset template
- [verification.ejs](views/mail/verification.ejs) for verification template

##### student/

The views in this folder are for student route.

- **fragment/** This folder contains views for fragments of student.
  - [about.ejs](views/student/fragment/about.ejs) for about a.k.a. settings fragment view
  - [classroom.ejs](views/student/fragment/classroom.ejs) for classroom
  - [fullweek.ejs](views/student/fragment/fullweek.ejs) for full schedule
  - [today.ejs](views/student/fragment/today.ejs) for today's schedule

- [student.ejs](views/student/student.ejs) for common methods among student views
- [studentdash.ejs](views/student/studentdash.ejs) for dashboard view (parent of fragments)
- [studentlogin.ejs](views/student/studentlogin.ejs) for login view.

##### teacher/

The views in this folder are for teacher route.

- **fragment/** This folder contains views for fragment of teacher.
  - [about.ejs](views/teacher/fragment/about.ejs) for about a.k.a. settings fragment view
  - [classroom.ejs](views/teacher/fragment/classroom.ejs) for classroom
  - [fullweek.ejs](views/teacher/fragment/fullweek.ejs) for full schedule
  - [today.ejs](views/teacher/fragment/today.ejs) for today's schedule

- [teacher.ejs](views/teacher/teacher.ejs) for common methods among teacher views
- [teacherdash.ejs](views/teacher/teacherdash.ejs) for dashboard view (parent of fragments)
- [teacherlogin.ejs](views/teacher/teacherlogin.ejs) for login view.

_The following views do not fall under sub-categories, and thus are directly under the parent folder._

##### [403.ejs](views/403.ejs)

View for http 403 network failure.

##### [404.ejs](views/404.ejs)

View for http 404 not found.

##### [500.ejs](views/500.ejs)

View for http 500 server error.

##### [home.ejs](views/home.ejs)

For homepage view, rendered by [server](#serverjs).

##### [invitation.ejs](views/invitation.ejs)

For invitation view, rendered by all routes conditionally.

##### [loader.ejs](views/loader.ejs)

For main loader, rendered at root of website, and the embedded script receives if a client is logged in, and then [relocates](#relocate) the address to appropriate dashboard, otherwise lands at [homepage](#homeejsviewhomeejs).

##### [offline.ejs](views/offline.ejs)

This file is rendered when network is disabled. Handled by [service worker](#swjspublicswjs).

##### [resetpassword.ejs](views/resetpassword.ejs)

For password reset view, rendered by all routes, via separate GET requests and parameters.

##### [verification.ejs](views/verification.ejs)

For verification view, rendered by all routes conditionally in the same way (if client's account is not verified).

##### Footnotes

- _Few more views are there in views directory, but not yet ready for documentation, therefore not included yet._

- _The names & paths of these view files are stored in variables of [Views](#views) class, and the server and routers access these views from the object of Views class defined in [codes.js](#codesjspublicscriptcodesjs). Therefore, it is important to note that if any of these views files or directories are changed or renamed, then it has to be made sure that these changes are also made in the Views class's variables accordingly, otherwise the server and routers would throw a file not found error, as there wont be any file specified in view object._

#### workers/

This folder contains server worker files, doing heavyweight tasks, to loosen the burden of [routes](#routes) and [server](#serverjs) files.

The tasks common to all client routes are grouped under the following folder.

##### common/

This folder contains worker files for all clients, and handles jobs common to them.

- [invitation.js](worker/common/invitation.js) Handles invitation related tasks for clients. Has methods to generate (via admin or teacher), or handle invitation link (via teacher or student).
- [mailer.js](worker/common/mailer.js) handles emailing process. Loads specific email templates from [mail views](#mail) and sends via it's methods, as per the provided arguments.
- [passwordreset.js](worker/common/passwordreset.js) handles password reset tasks similarly like invitation worker. Generates and handles password reset link for all clients, specifically.
- [session.js](worker/common/session.js) maintaines and works upon session creation, deletion and has methods to handle signup, login or re-authentication of clients.
- [sharedata.js](worker/common/sharedata.js) the methods in this file are called whenever a specified json object key values are to be filtered and retured, mostly used to filter account data, by removing passwords and other sensitive info from raw JSON and returning it.
- [timer.js](worker/common/timer.js) handles timings of application, creates dates and requrired incrementation in it for variety of timing related tasks of other workers.
- [verification.js](worker/common/verification.js) handles verification process, similar to password reset worker. Generates and handles verification links for all clients, specifically.

#### [server.js](server.js)

This is the starting point of application server, the default generator of routes, handler of root endpoints and renderer of server error files. This file starts connection to the MongoDB first, using method from db.js of [config/](#config) folder, sets routes for each client router, then creates http listeners using express module, and sets port for connection to the server.