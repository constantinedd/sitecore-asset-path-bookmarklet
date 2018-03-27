/* Retrieve all asset paths on a sitecore page, and display them in a modal window:
 *
 * Installation:
 * 1) Minify the javascript code below
 * 2) prepend 'javascript:' to the minified code (javascript:<minified-code>)
 * 3) In chrome add a new bookmark
 * 4) Paste the code from step 2 into the URL field
 * 5) Click Save
 * VERSION 5 :  Updated to handle block background images
 * NOTE: 10-24-17  - Need to update to include external js and css files
 */


(function($) {

    var $modal = $('<div class="modal modal-info fade" tabindex="-1" role="dialog"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-body"><div class="loading"></div></div></div></div></div>'),
        css = "<style>.asset-values span::before {content: attr(data-asset-count);font-size: 10px;position: absolute;margin-top: 4px;}.asset-values p:not(.asset-count) {line-height:20px;padding-left: 25px;margin-bottom: 5px;}.asset-values>.asset-count{border: none;margin-top:10px;}.asset-values>.asset-count strong{color: #000;}.asset-values>.asset-count .no-assets{color: red;}.asset-values>p{font-size:14px;margin:0;border-bottom:1px solid #e5e5e5;}.modal-body>h3{text-transform:uppercase;}.asset-values{margin-bottom:20px;}.loading{display:none;}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.loading{border-radius:50%;width:30px;height:30px;position:absolute;top:50%;left:50%;margin:-15px 0 0 -15px;border:.25rem solid rgba(0,0,0,.2);border-top-color:#000;-webkit-animation:spin 1s infinite linear;animation:spin 1s infinite linear}.modal-info{width:100%}.modal-info .modal-dialog{margin-top:100px;width:100%;padding:50px;max-width:1200px}.modal-info .modal-body{padding:0 20px 20px;min-height:480px;position:relative}.modal-info .btn{padding:7px;margin-bottom:0}.modal-info h3{color:#333;font-size:20px}.modal-info input{width:100%;margin-bottom:10px;display:block;height:25px}.modal-info .dismiss-modal{float:right}</style>",
        $modalBody = $modal.find('.modal-body');

    function getImages() {
        var $img = $('.ui-container img, .hero-article * , #hero-carousel *'),
            listOfImages = [];

        $img.each(function() {
            var $src = $(this).attr('src');
            if (!listOfImages.includes($src)) {
                listOfImages.push($src);
            }
        });

        $('.hero-article * , #hero-carousel *, .ui-container:not(#block-footer) *, #overflow-controller .outer:not(:last-of-type) *').each(function() {
            var $backgroundImagePaths = $(this).css('background-image');
            listOfImages.push($backgroundImagePaths);
        });

        var $featuredImage = $('head meta[itemprop="image"]').attr('content');

        if ($featuredImage) {
            listOfImages.push($featuredImage);
        }

        var $marqueeVideo = $('.hero-video-wrapper video source').attr('src');

        if ($marqueeVideo) {
            listOfImages.push($marqueeVideo);
        }

        return listOfImages;
    }


    function getDocuments() {
        var $anchors = $('.ui-container:not(#block-footer) a, #DownloadModule a'),
            listOfDocuments = [];

        $anchors.each(function() {
            var $documentHref = $(this).attr('href'),
                pdfExtension = /.pdf/;

            if (!listOfDocuments.includes($documentHref) && pdfExtension.test($documentHref)) {
                listOfDocuments.push($documentHref);
            }

        });

        return listOfDocuments;
    }


    function cycleAssetList() {
        var imageAssets = getImages(),
            documentAssets = getDocuments(),
            acnPattern = /spr-global/,
            captchaPattern = /BotDetectCaptcha/,
            finalValues = [];


        $.each(imageAssets, function(index, value) {

            if (acnPattern.test(value) || captchaPattern.test(value)) {
                imageAssets.splice(index, value);
                return;
            }

            if (value === undefined) {
                return;
            }

            var firstPath = value;
            value = firstPath.substring(firstPath.indexOf("_acnmedia"));

            var fileExtension = value.split('.').pop();
            value = value
                .replace('https://www.accenture.com', '')
                .replace(/~\/media|\/_acnmedia|_acnmedia/g, '/sitecore/media library')
                .replace(fileExtension, '')
                .replace('.', '');

            value = value.substring(value.indexOf("/sitecore/"));

            if (value && !finalValues.includes(value)) {
                finalValues.push(value);
            }

        });


        $.each(documentAssets, function(index, value) {

            if (value === undefined) {
                return;
            }

            value = value
                .replace('https://www.accenture.com', '')
                .replace(/.pdf#zoom=25|.pdf#zoom=50|.pdf#zoom=75|.pdf#zoom=100|.pdf/, '')
                .replace(/~\/media|\/_acnmedia|_acnmedia/g, '/sitecore/media library');

            value = value.substring(value.indexOf("/sitecore/"));

            if (value && !finalValues.includes(value)) {
                finalValues.push(value);
            }

        });

        return finalValues;
    }


    function setupModal() {
        $('body').append($modal).append(css);
        $modalBody.append('<h3>Asset Paths:</h3>');

        $modal.modal("show");

        $modal.on("click", ".dismiss-modal", function() {
            $modal.modal("hide");
        });
    }


    function printFinalValues() {

        var finalValues = cycleAssetList(),
            assetCount = 0,
            $modalContent = $('<div class="asset-values"></div>');


        $.each(finalValues, function(index, value) {
            assetCount++;
            $modalContent.append('<span data-asset-count="' + assetCount + '"></span><p>' + value + '</p>');

        });

        $modalBody.append($modalContent);

        if (assetCount === 0) {
            $modalContent.append('<p class="asset-count"><strong class="no-assets">' + assetCount + ' assets found.</strong></p>');
        } else

        if (assetCount === 1) {
            $modalContent.append('<p class="asset-count"><strong>' + assetCount + ' asset found.</strong></p>');
        } else {
            $modalContent.append('<p class="asset-count"><strong>' + assetCount + ' assets found.</strong></p>');
        }


    }

    setupModal();
    cycleAssetList();
    printFinalValues();


}(jQuery));
