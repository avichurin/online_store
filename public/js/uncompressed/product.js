var sneakerId = null;
var size = "";
var isOrder = false;
window.onload = function() {
    sneakerId = $("#sneakerId").text();
    setStartValues();
    if ($('.main-carousel').length) {
        $('.main-carousel').flickity({
            cellAlign: 'left',
            contain: true,
            prevNextButtons: false,
            on: {
                ready: function() {
                    $(".product").css("opacity", "1")
                }
            }
        });
    }
};

function setStartValues() {
    var left = 0,
        full = 0,
        time = 0;
    sessionStorage["limit"] = sessionStorage["limit"] || 0;
    if (sessionStorage["left_" + sneakerId]) {
        left = sessionStorage["left_" + sneakerId];
    } else {
        left = getRandomInt(2, 8);
        sessionStorage["left_" + sneakerId] = left;
    }
    $("#left").text(left);
    if (sessionStorage["full_" + sneakerId]) {
        full = sessionStorage["full_" + sneakerId];
    } else {
        full = getRandomInt(10, 31);
        sessionStorage["full_" + sneakerId] = full;
    }
    $("#full").text(full);
    if (sessionStorage["timeLeft"]) {
        setTimer(sessionStorage["timeLeft"]);
    } else {
        time = 1199;
        sessionStorage["timeLeft"] = time;
        setTimer(time);
    }
}

function toggleMenu() {
    $(".right-side-header_1").toggleClass("right-side-header-anim");
}

function zoomImage(isShow) {
    if (isShow) {
        $(".product").addClass("product_zoom_block");
        $("#main_image").addClass("product_zoom_image");
    } else {
        $(".product").removeClass("product_zoom_block");
        $("#main_image").removeClass("product_zoom_image");
    }
}

function setImage(el) {
    var src = $(el).attr('src');
    $(".product img").attr("src", src);
}

function showFullText(el) {
    let height = $(el).parent().find(".hand_text").get(0).scrollHeight;
    $(el).parent().find(".hand_text").animate({height: height}, 300, function () {
        $(el).css("display", "none");
        $(el).parent().find(".hand_text").removeClass("hand_text");
    });
}

function selectSize(el) {
    $("#MenSizes").css("display", "none");
    $("#WomenSizes").css("display", "none");
    $("#KidsSizes").css("display", "none");
    size = null;
    switch ($(el).find(":selected").val()) {
        case "1":
            size = "Men";
            $("#MenSizes").css("display", "inline-block");
            break;
        case "2":
            size = "Women";
            $("#WomenSizes").css("display", "inline-block");
            break;
        case "3":
            size = "Kids";
            $("#KidsSizes").css("display", "inline-block");
            break;
        default:
            $("#MenSizes").css("display", "none");
            $("#WomenSizes").css("display", "none");
            $("#KidsSizes").css("display", "none");
            break
    }
}

function setSize(el) {
    $(".current_size").text(size + " " + $(el).val());
}

function setTimer(seconds) {
    var numsec = seconds;
    var ONE_HOUR = 3600;
    var ONE_MINUTE = 60;
    setTime();
    setInterval(function() {
        if (numsec < 0) {
            numsec = 86399;
            sessionStorage["timeLeft"] = 0;
        }
        setTime();
    }, 1000);

    function getTime() {
        var hours = parseInt(numsec / ONE_HOUR);
        var mins = parseInt((numsec - (hours * ONE_HOUR)) / ONE_MINUTE);
        var secs = parseInt((numsec - (hours * ONE_HOUR)) - (mins * ONE_MINUTE));
        return setNull(hours) + ":" + setNull(mins) + ":" + setNull(secs);
    }

    function setTime() {
        $(".time_left").html(getTime());
        sessionStorage["timeLeft"] = numsec - 1;
        numsec--;
    }

    function setNull(num) {
        return (num > 9) ? num : "0" + num;
    }
}

function selectPayWay(num) {
    if (num === 1) {
        $("#card").parent().find("label").addClass("picture_active");
        $("#paypal").parent().find("label").removeClass("picture_active");
    } else {
        $("#card").parent().find("label").removeClass("picture_active");
        $("#paypal").parent().find("label").addClass("picture_active");
    }
}

function selectAddress(num) {
    if (num === 1) {
        $("#shippingAddress").css("display", "none");
    } else {
        $("#shippingAddress").css("display", "block");
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function setContent(num, isMob) {
    switch (num) {
        case 1:
            if (isMob) {
                $(".path").text("Checkout (step 1/2)");
            }
            if (size && $("#" + size + "Sizes select").val() !== "") {
                $("#basic_page").css("display", "none");
                $("#information_page").css("display", "block");
                $(window).scrollTop(0);
            } else {
                alert("Select size for the shoes");
            }
            break;
        case 2:
            if (isMob) {
                $(".path").text("Checkout (step 2/2)");
            }
            if (checkForm(num)) {
                $("#payment_page").css("display", "block");
                $("#information_page").css("display", "none");
                $(window).scrollTop(0);
            }
            break;
        case 3:
            if (!isOrder) {
                if (checkForm(num)) {
                    var limit = parseInt(sessionStorage["limit"], 10);
                    if (limit < 3) {
                        sessionStorage["limit"] = limit + 1;
                        isOrder = true;
                        $("#compvareBut").css("background-color", "#e2e4e6");
                        $("#compvareBut").text("Loading");
                        $("#compvareBut").removeClass("btn-danger");
                        sendData();
                    } else {
                        location.href = "/";
                    }
                }
            }
            break;
    }
}

function checkForm(num) {
    var re = /\S+@\S+\.\S+/;
    switch (num) {
        case 2:
            if (!re.test($("#mail1").val())) {
                alert("Enter your email in the form");
                return false;
            }
            if ($("#firstname1").val() !== "" && $("#lastname1").val() !== "" && $("#state1").val() !== "" && $("#city1").val() !== "" && $("#address1").val() !== "" && $("#zipcode1").val() !== "") {
                return true;
            } else {
                alert("Fill all the fields in the form");
                return false;
            }
        case 3:
            if ($("#shipping_address").is(':checked')) {
                return true;
            }
            if ($("#firstname2").val() !== "" && $("#lastname2").val() !== "" && $("#state2").val() !== "" && $("#city2").val() !== "" && $("#address2").val() !== "" && $("#zipcode2").val() !== "") {
                return true;
            } else {
                alert("You need to fill all the fields in the form");
                return false;
            }
    }
}

function sendData() {
    var data = {};
    data.firm = $("#firmAlias").text();
    data.model = $("#modelAlias").text();
    data.sneaker = $("#sneakerAlias").text();
    data.size = size + " " + $("#" + size + "Sizes select").val();
    data.email = $("#mail1").val();
    data.contacts = {};
    data.contacts.firstName = $("#firstname1").val();
    data.contacts.lastName = $("#lastname1").val();
    data.contacts.address = $("#address1").val();
    data.contacts.city = $("#city1").val();
    data.contacts.state = $("#state1").val();
    data.contacts.zipCode = $("#zipcode1").val();
    data.contacts.country = "United States";
    if ($("#card").is(':checked')) {
        data.pay = "card";
    } else {
        data.pay = "paypal";
    }
    if ($("#shipping_address").is(':checked')) {
        data.shipAddress = "true";
    } else {
        data.shipAddress = "false";
        data.shipContacts = {};
        data.shipContacts.firstName = $("#firstname2").val();
        data.shipContacts.lastName = $("#lastname2").val();
        data.shipContacts.address = $("#address2").val();
        data.shipContacts.city = $("#city2").val();
        data.shipContacts.state = $("#state2").val();
        data.shipContacts.zipCode = $("#zipcode2").val();
        data.shipContacts.country = "United States";
    }
    $.ajax({
        url: "http://" + location.host + '/order',
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        processData: false,
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            window.location = "http://" + location.host + '/success'
        },
        error: function() {}
    });
}