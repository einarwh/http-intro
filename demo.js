var express = require('express');
var app = express();
var fs = require('fs');

app.use(express.urlencoded());
app.use(express.json());

var port = 8008;

function get_link(resource) {
  return "http://localhost:" + port + "/" + resource;
}

function read_things() {
  var data = fs.readFileSync("files/things.json");
  var result = JSON.parse(data);
  return result;
}

var things = read_things();

function sendTextSicp(res) {
  var text = "Programs should be written for people to read and only incidentally for computers to execute.";
  res.contentType("text/plain");
  res.send(text);
}

function sendImageSicp(res) {
  res.contentType("image/jpg");
  fs.readFile("files/sicp.jpg", function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.end(data);
  });
}

function sendAdventurer(res, contentType, fileName) {
  res.contentType(contentType);
  fs.readFile(fileName, function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.end(data);
  });

}

function sendTextAdventurer(res) {
  sendAdventurer(res, "text/plain", "files/quux.txt");
}

function sendHtmlAdventurer(res) {
  sendAdventurer(res, "text/html", "files/quux.html");
}

function sendJsonAdventurer(res) {
  sendAdventurer(res, "application/json", "files/quux.json");
}

function sendXmlAdventurer(res) {
  sendAdventurer(res, "application/xml", "files/quux.xml");
}

app.get('/sicp', function(req, res) {
  var accept = req.headers.accept;
  if (accept === "image/jpg") {
    sendImageSicp(res);
    return;
  }
  sendTextSicp(res);
});

app.get('/quux', function(req, res) {
  var accept = req.headers.accept;
  if (accept === "application/xml") {
    sendXmlAdventurer(res);
    return;
  }
  if (accept === "application/json") {
    sendJsonAdventurer(res);
    return;
  }
  if (accept === "text/html") {
    sendHtmlAdventurer(res);
    return;
  }

  sendTextAdventurer(res);
});

app.get('/things', function(req, res) {
  res.contentType("application/json");
  res.send(things + "\n");
});

app.get('/things/:ix', function(req, res) {
  var ix = req.params.ix;
  var t = things[ix - 1];
  if (t === undefined) {
    res.status(404).send();
    return;
  }
  res.contentType("application/json");
  res.send(t + "\n");
});

app.post('/things', function(req, res) {
  if (req.body.thing === undefined) {
    res.status(400).send();
    return;
  }
  var t = req.body.thing;
  if (things.indexOf(t) < 0) {
    things.push(req.body.thing);
    var ix = things.length;
    res.status(201).location(get_link("things/" + ix)).send();
    return;
  }
  res.status(409).send();
});

app.delete('/things/:ix', function(req, res) {
  var ix = req.params.ix;
  var t = things[ix - 1];  
  if (t === undefined) {
    res.status(404).send();
    return;
  }
  things.splice(ix - 1, 1);
  res.status(204).send(t + "\n");
});

app.put('/things/:ix', function(req, res) {
  var ix = req.params.ix;
  var old = things[ix - 1];  
  if (old === undefined) {
    res.status(404).send();
    return;
  }
  if (req.body.thing === undefined) {
    res.status(400).send();
    return;
  }
  var t = req.body.thing;
  things[ix - 1] = t;
  res.status(200).send(t + "\n");
});

app.listen(port);
