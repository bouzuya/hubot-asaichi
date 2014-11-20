# Description
#   A Hubot script that returns asaichi schedule
#
# Configuration:
#   None
#
# Commands:
#   hubot asaichi - returns asaichi schedule
#
# Author:
#   bouzuya <m@bouzuya.net>
#
module.exports = (robot) ->
  request = require 'request-b'
  cheerio = require 'cheerio'
  moment = require 'moment'
  table = require 'text-table'
  eaw = require 'eastasianwidth'

  toHalfWidth = (s) ->
    s.replace /[\uff00-\uffef]/g, (c) ->
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)

  robot.respond /asaichi$/i, (res) ->
    url = 'http://www1.nhk.or.jp/asaichi/weekly/'
    request(url).then (r) ->
      $ = cheerio.load r.body
      dates = []
      $('#main_con h2').each ->
        e = $ @
        toHalfWidth(e.text()).replace(/(\d+)月(\d+)日/, (_, month, date) ->
          today = moment()
          today.month(month)
          today.date(date)
          dates.push today.format('YYYY-MM-DD')
        )
      values = []
      $('#main_con dl').each ->
        e = $ @
        dts = []
        e.find('dt img').each ->
          e2 = $ @
          dts.push e2.attr('alt').trim()
        dds = []
        e.find('dd').each ->
          e2 = $ @
          dds.push e2.text().replace(/[\u3000\s]/g, '').trim()
        values.push dts.map (item, i) ->
          [item, dds[i]]
      rows = dates.reduce (rows, item, i) ->
        rows.concat([[item, '']]).concat(values[i])
      , []
      res.send table(rows, { stringLength: (c) -> eaw.length(c) })
