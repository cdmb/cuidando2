define(["jquery", 'pubsub', 'app/urlmanager', 'app/templates', 'app/multilang'], function($, pubsub, urlManager, templates, multilang) {

    'use strict';

    // views = {
    //     despesa: [map, pointInfo, comments],
    //     ano: [yearSelector, map, charts, datatable],
    //     pessoa: [user],
    // }

    templates.smartApply('menu', {})
    multilang.init()

    var visible = []

    function updateView() {
        var shouldBeVisible = $("*[data-view*='" + urlManager.getParam('root') + "']")

        console.log("root", urlManager.getParam('root'))
        console.log("vissss", visible)
        console.log("SHOULD", shouldBeVisible)

        // Remove from "visible" the elements thas should continue visible
        $.each(shouldBeVisible, function(i, element) {
            var index = $.inArray(element, visible)
            if (index != -1) {
                // Already visible
                visible.splice(index, 1)
                console.log("JAAAA", element.id)
            } else {
                // New element
                console.log("SHOW!!", element.id)
                $(element).show({propagate: true})
            }
        })

        // Hide the ones left in visible
        $(visible).hide({propagate: true})
        // $.each(visible, function(index, element) {
        //     console.log("esconder vários: ", visible)
        //     $(visible).hide({propagate: true})
        // })

        // Replaced the now hidden ones with the real visible
        visible = shouldBeVisible
    }

    pubsub.subscribe("root.changed", function(event, data) {
        updateView()
    })


    // Button to go back to year view
    $("#to-general").click(function () {
        urlManager.route("ano", urlManager.getParam('year'))
    })

    // Button to go home
    $("#home-button").click(function () {
        urlManager.routeDefault()
        return false
    })

    // Button to share page
    $("#share-button").click(function () {
        var page = encodeURIComponent(location.href)
        var title = "Cuidando 2"
        location.href = 'http://www.facebook.com/sharer.php?u=' + page + '&t=' + title
        return false
    })



    // $("[data-route]").click()

    function init() {
        updateView()
        pubsub.endedInitFase = true
    }

    return init
})