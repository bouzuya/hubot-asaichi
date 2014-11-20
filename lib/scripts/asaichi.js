// Description
//   A Hubot script that returns asaichi schedule
//
// Configuration:
//   None
//
// Commands:
//   hubot asaichi - returns asaichi schedule
//
// Author:
//   bouzuya <m@bouzuya.net>
//
module.exports = function(robot) {
  var cheerio, eaw, moment, request, table, toHalfWidth;
  request = require('request-b');
  cheerio = require('cheerio');
  moment = require('moment');
  table = require('text-table');
  eaw = require('eastasianwidth');
  toHalfWidth = function(s) {
    return s.replace(/[\uff00-\uffef]/g, function(c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xfee0);
    });
  };
  return robot.respond(/asaichi$/i, function(res) {
    var url;
    url = 'http://www1.nhk.or.jp/asaichi/weekly/';
    return request(url).then(function(r) {
      var $, dates, rows, values;
      $ = cheerio.load(r.body);
      dates = [];
      $('#main_con h2').each(function() {
        var e;
        e = $(this);
        return toHalfWidth(e.text()).replace(/(\d+)月(\d+)日/, function(_, month, date) {
          var today;
          today = moment();
          today.month(month);
          today.date(date);
          return dates.push(today.format('YYYY-MM-DD'));
        });
      });
      values = [];
      $('#main_con dl').each(function() {
        var dds, dts, e;
        e = $(this);
        dts = [];
        e.find('dt img').each(function() {
          var e2;
          e2 = $(this);
          return dts.push(e2.attr('alt').trim());
        });
        dds = [];
        e.find('dd').each(function() {
          var e2;
          e2 = $(this);
          return dds.push(e2.text().replace(/[\u3000\s]/g, '').trim());
        });
        return values.push(dts.map(function(item, i) {
          return [item, dds[i]];
        }));
      });
      rows = dates.reduce(function(rows, item, i) {
        return rows.concat([[item, '']]).concat(values[i]);
      }, []);
      return res.send(table(rows, {
        stringLength: function(c) {
          return eaw.length(c);
        }
      }));
    });
  });
};
