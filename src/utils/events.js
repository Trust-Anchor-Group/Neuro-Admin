import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();

export function paymentComplete(Data) {
  if (Data.Ok) {
    eventEmitter.emit('paymentComplete', Data);
    window.location.href = "paymentPage?Success=true" + "&Amount=" + encodeURIComponent(Data.Amount) + "&Currency=" + encodeURIComponent(Data.Currency) + "&Context=" + encodeURIComponent(Data.Context);
  } else {
    eventEmitter.emit('paymentComplete', Data);
    window.location.href = "paymentPage?Success=false" + "&Error=" + encodeURIComponent(Data.Error) + "&Context=" + encodeURIComponent(Data.Context);
  }
}

export function TransactionChanged(transaction) {
  console.log(transaction);
  console.log(JSON.stringify(transaction));

  if (transaction.state == "Executing") {
    window.open(transaction.clientUrl)
  } else if (transaction.state == "Committed") {
    eventEmitter.emit('transactionCompleted', true);
  } else {
    eventEmitter.emit('transactionCompleted', false);

  }
}

export function purchaseFailedStatus(payment) {
  if (payment) {
    var paymentStatus = payment;
    eventEmitter.emit('paymentFailed', paymentStatus);
  } else {
    signedStatus = false;
  }
}


export function signStatus(signed) {

  if (signed) {
    signedStatus = signed;
    eventEmitter.emit('statusChanged', signedStatus);
  } else {
    signedStatus = false;
  }
}

function CheckEvents(TabID) {
  try {
    if ("WebSocket" in window) {
      CheckEventsWS(TabID);
      return;
    }
  }
  catch (e) {
    // Try fallback mechanism
  }

  CheckEventsXHTTP(TabID);
}

export function printthing(thing) {
  console.log("the here: " + thing);
}

export function FindNeuronDomains() {
  var Meta = document.getElementsByTagName('meta');
  var c = Meta.length;
  var i;
  const neuronDomains = [];

  for (i = 0; i < c; i++) {
    var Name = Meta[i].getAttribute("name");
    if (Name && Name.toLowerCase() == "neuron") {
      var Domain = Meta[i].getAttribute("content");
      if (Domain && !neuronDomains.includes(Domain))
        neuronDomains.push(Domain);
    }
  }
  if (!neuronDomains.length) {
    neuronDomains.push(window.location.host);
  }
  console.log(neuronDomains)
  return neuronDomains;
}

export function CheckEventsWS(TabID) {
  const neuronDomains = FindNeuronDomains();
  const SocketMap = new Map();
  console.log(neuronDomains);

  neuronDomains.forEach((domain) => {
    var Uri;
    if (window.location.protocol === "https:") Uri = "wss:";
    else Uri = "ws:";

    Uri += "//" + domain + "/ClientEventsWS";

    console.log("Connecting to server for client events using WebSocket for domain: " + domain);

    var EventSocket = new WebSocket(Uri, ["ls"]);
    var PingTimer = null;

    SocketMap.set(domain, {
      socket: EventSocket,
      pingTimer: null,
    });

    EventSocket.onopen = async function () {
      console.log("WebSocket opened for domain: " + domain);

      EventSocket.send(
        JSON.stringify({
          cmd: "Register",
          tabId: TabID,
          location: window.location.href,
        })
      );

      PingTimer = window.setInterval(function () {
        if (EventSocket && EventSocket.readyState === WebSocket.OPEN) {
          console.log("Ping for domain: " + domain);

          EventSocket.send(
            JSON.stringify({
              cmd: "Ping",
            })
          );
        } else {
          if (PingTimer) {
            window.clearInterval(PingTimer);
            PingTimer = null;
          }

          if (EventCheckingEnabled) {
            PageOutOfSync = true;
            CheckEventsWS(TabID);
          }
        }
      }, 10000);

      // Store the ping timer for the current socket
      SocketMap.get(domain).pingTimer = PingTimer;
    };

    EventSocket.onmessage = async function (event) {
      if (PageOutOfSync) {
        console.log("Reloading page to synchronize content for domain: " + domain);

        await ClearCacheAsync(null);
        Reload(null);
        return;
      }

      var Event;
      var s = event.data;
      if (s === "" || s === null) return;

      try {
        Event = JSON.parse(s);
      } catch (e) {
        console.log(e);
        console.log(s);
      }
      console.log("Event for domain: " + domain);

      EvaluateEvent(Event);
    };

    EventSocket.onerror = function () {
      console.log("Connection error for domain: " + domain);

      if (PingTimer) {
        window.clearInterval(PingTimer);
        PingTimer = null;
      }

      if (EventCheckingEnabled) {
        window.setTimeout(function () {
          PageOutOfSync = true;
          CheckEventsWS(TabID);
        }, 5000);
      }
    };

    EventSocket.onclose = function () {
      console.log("WebSocket closed for domain: " + domain);

      if (PingTimer) {
        window.clearInterval(PingTimer);
      }

      SocketMap.delete(domain);
    };
  });

  window.onbeforeunload = function () {
    console.log("Unloading page.");

    EventCheckingEnabled = false;

    SocketMap.forEach(({ socket, pingTimer }, domain) => {
      if (pingTimer) {
        window.clearInterval(pingTimer);
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Unregistering Tab for domain: " + domain);

        socket.send(
          JSON.stringify({
            cmd: "Unregister",
          })
        );

        socket.close(1000, "Page closed.");
      }
    });

    SocketMap.clear();
  };
}

export function CheckEventsXHTTP(TabID) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = async function () {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200) {
        if (PageOutOfSync) {
          console.log("Reloading page to synchronize content.");

          await ClearCacheAsync(null);
          Reload(null);
          return;
        }

        var Events;
        var i, c;

        try {
          var s = xhttp.responseText;

          if (s && s !== "") {
            try {
              Events = JSON.parse(s);
            }
            catch (e) {
              console.log(e);
              console.log(s);
            }

            if (Events) {
              c = Events.length;
              for (i = 0; i < c; i++)
                EvaluateEvent(Events[i]);
            }
          }
        }
        finally {
          if (EventCheckingEnabled) {
            console.log("Ping");

            xhttp.open("POST", "/ClientEvents", true);
            xhttp.setRequestHeader("Content-Type", "text/plain");
            xhttp.setRequestHeader("X-TabID", TabID);
            xhttp.send(window.location.href);
          }
        }
      }
      else {
        ShowError(xhttp);

        if (EventCheckingEnabled) {
          window.setTimeout(function () {
            console.log("Reconnecting");

            PageOutOfSync = true;
            xhttp.open("POST", "/ClientEvents", true);
            xhttp.setRequestHeader("Content-Type", "text/plain");
            xhttp.setRequestHeader("X-TabID", TabID);
            xhttp.send(window.location.href);
          }, 5000);
        }
      }
      //eslint-disable-next-line
    };
    //eslint-disable-next-line
  }

  EventCheckingEnabled = true;

  console.log("Connecting to server for client events using XML/HTTP-Request.");

  xhttp.open("POST", "/ClientEvents", true);
  xhttp.setRequestHeader("Content-Type", "text/plain");
  xhttp.setRequestHeader("X-TabID", TabID);
  xhttp.send(window.location.href);
}

function EvaluateEvent(Event) {
  if (Event && Event.type.match(/^[a-zA-Z0-9]+$/g)) {
    try {
      console.log(Event.type);
      eval(Event.type + "(Event.data)");
    }
    catch (e) {
      console.log(e);
    }
  }
}

function CloseEvents() {
  console.log("Stopping event reception.");
  EventCheckingEnabled = false;
}

function ShowError(xhttp) {
  console.log("Error received: " + xhttp.responseText);

  if (xhttp.responseText.length > 0)
    window.alert(xhttp.responseText);
}

function CreateGUID() {
  function Segment() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return Segment() + Segment() + '-' + Segment() + '-' + Segment() + '-' + Segment() + '-' + Segment() + Segment() + Segment();
}

function NOP(Data) {
}

async function ClearCacheAsync(Data) {
  try {
    console.log("Clearing cache.");

    var Keys = await caches.keys();
    var Tasks = Keys.map(Key => caches.delete(Key));

    await Promise.all(Tasks);

    console.log("Cache has been cleared.");
  }
  catch (e) {
    console.log(e);
  }
}

function Reload(Data) {
  ClearReloadTimer();
  window.location.reload(false);
}

function ClearReloadTimer() {
  if (ReloadTimer) {
    window.clearTimeout(ReloadTimer);
    ReloadTimer = null;
  }
}

function SetReloadTimer() {
  ClearReloadTimer();
  ReloadTimer = window.setTimeout(async function () {
    await ClearCacheAsync();
    Reload(null);
  }, 3000);
}

function OpenUrl(Url) {
  window.open(Url, "_blank");
}

function EndsWith(String, Suffix) {
  var c = String.length;
  var d = Suffix.length;

  if (c < d)
    return false;

  return String.substring(c - d, c) === Suffix;
}

function CheckServerInstance(ID) {
  if (ServerIDs.length === 0)
    ServerIDs.push(ID);
  else if (!ServerIDs.includes(ID) && ServerIDs.length < FindNeuronDomains().length) {
    ServerIDs.push(ID);
  } else if (ServerIDs.length == FindNeuronDomains().length) {
    Reload(null);
  }
}

function POST(Content, Resource) {
  if (Resource === undefined)
    Resource = window.location.href;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200) {
        var s = xhttp.responseText;
        var i = s.indexOf("<body>");
        var j = s.indexOf("</body>");

        if (i >= 0 && j >= i) {
          s = s.substring(i + 6, j);
          document.body.innerHTML = s;
        }
      }
      else
        ShowError(xhttp);
      //eslint-disable-next-line
    };
    //eslint-disable-next-line
  }

  xhttp.open("POST", Resource, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ "tab": TabID, "data": Content }));
}

function LoadContent(Id) {
  if (ContentQueue === null) {
    ContentQueue = [];

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
          console.log("Received asynchronous content " + Id);

          var Div = document.getElementById("id" + Id);
          if (Div)
            SetDynamicHtml(Div, xhttp.responseText);

          if (xhttp.getResponseHeader("X-More") === "1") {
            console.log("Loading more asynchronous content from " + Id);
            xhttp.open("GET", "/ClientEvents/" + Id, true);
            xhttp.send();
            return;
          }
        }
        else {
          console.log("Unable to receive asynchronous content " + Id);
          ShowError(xhttp);
        }

        if (ContentQueue.length === 0) {
          console.log("Loading of asynchronous content completed.");
          ContentQueue = null;
        }
        else {
          Id = ContentQueue.shift();
          console.log("Loading asynchronous content " + Id);
          xhttp.open("GET", "/ClientEvents/" + Id, true);
          xhttp.send();
        }
        //eslint-disable-next-line
      };
      //eslint-disable-next-line
    }

    console.log("Loading asynchronous content " + Id);
    xhttp.open("GET", "/ClientEvents/" + Id, true);
    xhttp.send();
  }
  else {
    console.log("Queueing loading of asynchronous content " + Id);
    ContentQueue.push(Id);
  }
}

function SetDynamicHtml(ParentElement, Html) {
  var Script = [];
  var HtmlLower = Html.toLocaleLowerCase();
  var i = HtmlLower.indexOf("<script");

  while (i >= 0) {
    var j = HtmlLower.indexOf("</script>", i + 7);
    if (j < 0)
      break;

    Script.push(Html.substring(i + 8, j));

    Html = Html.substring(0, i) + Html.substring(j + 9);
    HtmlLower = HtmlLower.substring(0, i) + HtmlLower.substring(j + 9);

    i = HtmlLower.indexOf("<script", i);
  }

  ParentElement.innerHTML = Html;

  var c = Script.length;

  for (i = 0; i < c; i++) {
    try {
      eval(Script[i]);
    }
    catch (e) {
      console.log(e);
    }
  }
}

var ContentQueue = null;
export var TabID;
export var signedStatus = false;
var ServerIDs = [];
var EventCheckingEnabled = true;
var PageOutOfSync = false;
var ReloadTimer = null;

try {
  if (window.name.length === 36)
    TabID = window.name;
  else
    TabID = window.name = CreateGUID();
}
catch (e) {
  TabID = CreateGUID();
}

CheckEvents(TabID);
