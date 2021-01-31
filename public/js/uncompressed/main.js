window.onload = function () {
    setSneakersHeight();
    $(window).resize(function () {
        setSneakersHeight();
    });
};

function setSneakersHeight() {
    var width = $(".works_img_in").eq(0).width();
    $(".works_img_in").parent().each(function () {
        $(this).height(width + "px");
    });
}

function toggleMenu() {
    $(".right-side-header_1").toggleClass("right-side-header-anim");
    if ($(".right-side-header_1").hasClass("right-side-header-anim")) {
        $(document.body).css("overflow-y", "hidden");
    } else {
        $(document.body).css("overflow-y", "auto");
    }
}

function selectFirm(el, name, isMob) {
    $(".brand_item").each(function () {
        $(this).removeClass("brand_item_active");
    });
    $(".brand_adidas").attr("src", "images/brand_adidas.png");
    $(".brand_nike").attr("src", "images/brand_nike.png");
    $(".brand_jordan").attr("src", "images/brand_jordan.png");
    $(".brand_vans").attr("src", "images/brand_vans.png");
    $(".brand_custom").attr("src", "images/brand_custom.png");
    $(el).addClass("brand_item_active");
    $(el).find("img").attr("src", "images/brand_" + name + "_active.png");
    $("#content_two").children().each(function () {
        $(this).css("display", "none");
    });

    var display = isMob ? "block" : "flex";
    switch (name) {
        case "nike":
            $("#firm_0").css("display", display);
            break;
        case "adidas":
            $("#firm_1").css("display", display);
            break;
        case "jordan":
            $("#firm_2").css("display", display);
            break;
        case "vans":
            $("#firm_3").css("display", display);
            break;
        case "custom":
            $("#firm_4").css("display", display);
            break;
    }
}