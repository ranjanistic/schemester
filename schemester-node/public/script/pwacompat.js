var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.createTemplateTagFirstArg=function(l){return l.raw=l};$jscomp.createTemplateTagFirstArgWithRaw=function(l,p){l.raw=p;return l};function unused(){"Please don't use this file directly: include pwacompat.min.js instead!"}
(function(){function l(a){try{return document.head.querySelector(a)}catch(b){return null}}function p(a,b){a="__pwacompat_"+a;void 0!==b&&(n[a]=b);return n[a]}function q(){var a=(w=l('link[rel="manifest"]'))?w.href:"";if(!a)throw'can\'t find <link rel="manifest" href=".." />\'';var b=J([a,location]),e=p("manifest");if(e)try{var m=JSON.parse(e);x(m,b)}catch(C){console.warn("PWACompat error",C)}else{var c=new XMLHttpRequest;c.open("GET",a);c.withCredentials="use-credentials"===w.getAttribute("crossorigin");
c.onload=function(){try{var a=JSON.parse(c.responseText);p("manifest",c.responseText);x(a,b)}catch(r){console.warn("PWACompat error",r)}};c.send(null)}}function J(a){for(var b={},e=0;e<a.length;b={$jscomp$loop$prop$opt$7:b.$jscomp$loop$prop$opt$7},++e){b.$jscomp$loop$prop$opt$7=a[e];try{return new URL("",b.$jscomp$loop$prop$opt$7),function(a){return function(b){return(new URL(b||"",a.$jscomp$loop$prop$opt$7)).toString()}}(b)}catch(m){}}return function(a){return a||""}}function D(a,b,e){if(!l(a+e)){a=
document.createElement(a);for(var c in b)a.setAttribute(c,b[c]);document.head.appendChild(a);return a}}function c(a,b){b&&(!0===b&&(b="yes"),D("meta",{name:a,content:b},'[name="'+a+'"]'))}function t(a){a=a.sizes.split(/\s+/g).map(function(a){return"any"===a?Infinity:parseInt(a,10)||0});return Math.max.apply(null,a)}function x(a,b){function e(b,d,e,c){var f=window.devicePixelRatio,g=E({width:b*f,height:d*f});g.scale(f,f);g.fillStyle=y;g.fillRect(0,0,b,d);g.translate(b/2,(d-20)/2);c&&(d=c.width/f,f=
c.height/f,128<f&&(d/=f/128,f=128),48<=d&&48<=f&&(g.drawImage(c,d/-2,f/-2,d,f),g.translate(0,f/2+20)));g.fillStyle=B?"white":"black";g.font="24px HelveticaNeue-CondensedBold";c=getComputedStyle(w);g.font=c.getPropertyValue("--pwacompat-splash-font");f=a.name||a.short_name||document.title;d=g.measureText(f);c=d.actualBoundingBoxAscent||24;g.translate(0,c);if(d.width<.8*b)g.fillText(f,d.width/-2,0);else for(f=f.split(/\s+/g),d=1;d<=f.length;++d){var G=f.slice(0,d).join(" "),h=g.measureText(G).width;
if(d===f.length||h>.6*b)g.fillText(G,h/-2,0),g.translate(0,1.2*c),f.splice(0,d),d=0}return function(){var a=g.canvas.toDataURL();m(e,a);return a}}function m(a,b){var d=document.createElement("link");d.setAttribute("rel","apple-touch-startup-image");d.setAttribute("media","(orientation: "+a+")");d.setAttribute("href",b);document.head.appendChild(d)}function n(a,b){var d=window.screen,c=e(d.width,d.height,"portrait",a),g=e(d.height,d.width,"landscape",a);setTimeout(function(){u.p=c();setTimeout(function(){u.l=
g();b()},10)},10)}function C(a){var b=z.length+1,c=function(){--b||a()};c();z.forEach(function(a){var b=new Image;b.crossOrigin="anonymous";b.onerror=c;b.onload=function(){b.onload=null;a.href=H(b,y,!0);u.i[b.src]=a.href;c()};b.src=a.href})}function r(){p("iOS",JSON.stringify(u))}function q(){var b=z.shift();if(b){var d=new Image;d.crossOrigin="anonymous";d.onerror=function(){return void q()};d.onload=function(){d.onload=null;n(d,function(){var c=a.background_color&&H(d,y);c?(b.href=c,u.i[d.src]=
c,C(r)):r()})};d.src=b.href}else n(null,r)}var k=a.icons||[],h=k.filter(function(a){return(a.purpose||"").includes("maskable")});k.sort(function(a,b){return t(b)-t(a)});h.sort(function(a,b){return t(b)-t(a)});var z=(0<h.length?h:k).map(function(a){var c={rel:"icon",href:b(a.src),sizes:a.sizes},e='[sizes="'+a.sizes+'"]';D("link",c,'[rel="icon"]'+e);if(A&&!(120>t(a)))return c.rel="apple-touch-icon",D("link",c,'[rel="apple-touch-icon"]'+e)}).filter(Boolean);h=l('meta[name="viewport"]');var x=!!(h&&h.content||
"").match(/\bviewport-fit\s*=\s*cover\b/),v=a.display;h=-1!==K.indexOf(v);c("mobile-web-app-capable",h);L(a.theme_color||"black",x);M&&(c("application-name",a.short_name),c("msapplication-tooltip",a.description),c("msapplication-starturl",b(a.start_url||".")),c("msapplication-navbutton-color",a.theme_color),(k=k[0])&&c("msapplication-TileImage",b(k.src)),c("msapplication-TileColor",a.background_color));c("theme-color",a.theme_color);if(A){var y=a.background_color||"#f8f9fa",B=I(y);(k=N(a.related_applications))&&
c("apple-itunes-app","app-id="+k);c("apple-mobile-web-app-capable",h);c("apple-mobile-web-app-title",a.short_name||a.name);if(h=p("iOS"))try{var F=JSON.parse(h);m("portrait",F.p);m("landscape",F.l);z.forEach(function(a){var b=F.i[a.href];b&&(a.href=b)});return}catch(g){}var u={i:{}};q()}else k={por:"portrait",lan:"landscape"}[String(a.orientation||"").substr(0,3)]||"",c("x5-orientation",k),c("screen-orientation",k),"fullscreen"===v?(c("x5-fullscreen","true"),c("full-screen","yes")):h&&(c("x5-page-mode",
"app"),c("browsermode","application"))}function N(a){var b;(a||[]).filter(function(a){return"itunes"===a.platform}).forEach(function(a){a.id?b=a.id:(a=a.url.match(/id(\d+)/))&&(b=a[1])});return b}function L(a,b){if(A||O){var e=I(a);if(A)c("apple-mobile-web-app-status-bar-style",b?"black-translucent":e?"black":"default");else{a:{try{var m=Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;break a}catch(P){}m=void 0}if(b=m)e=e?255:0,b.foregroundColor={r:e,g:e,b:e,a:255},a=v(a),b.backgroundColor=
{r:a[0],g:a[1],b:a[2],a:a[3]}}}}function v(a){var b=E();b.fillStyle=a;b.fillRect(0,0,1,1);return b.getImageData(0,0,1,1).data||[]}function I(a){a=v(a).map(function(a){a/=255;return.03928>a?a/12.92:Math.pow((a+.055)/1.055,2.4)});return 3<Math.abs(1.05/(.2126*a[0]+.7152*a[1]+.0722*a[2]+.05))}function H(a,b,c){c=void 0===c?!1:c;var e=E(a);e.drawImage(a,0,0);if(c||255!==e.getImageData(0,0,1,1).data[3])return e.globalCompositeOperation="destination-over",e.fillStyle=b,e.fillRect(0,0,a.width,a.height),
e.canvas.toDataURL()}function E(a){var b=void 0===a?{width:1,height:1}:a;a=b.width;b=b.height;var c=document.createElement("canvas");c.width=a;c.height=b;return c.getContext("2d")}if("onload"in XMLHttpRequest.prototype&&!navigator.standalone){var K=["standalone","fullscreen","minimal-ui"],B=navigator.userAgent||"",A=navigator.vendor&&-1!==navigator.vendor.indexOf("Apple")&&(-1!==B.indexOf("Mobile/")||"standalone"in navigator)||!1,M=!!B.match(/(MSIE |Edge\/|Trident\/)/),O="undefined"!==typeof Windows,
w;try{var n=sessionStorage}catch(a){}n=n||{};"complete"===document.readyState?q():window.addEventListener("load",q)}})();