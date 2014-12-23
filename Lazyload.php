<?php
/**
 * Lazyload extension
 *
 * @file
 * @ingroup Extensions
 */

if ( !defined( 'MEDIAWIKI' ) ) { die(); }

// credits
$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'Lazyload',
	'version' => '0.2.3',
	'author' => array( 'Mudkip' ),
	'url' => 'https://github.com/mudkipme/mediawiki-lazyload',
	'descriptionmsg'  => 'lazyload-desc',
);

$wgExtensionMessagesFiles['Lazyload'] = dirname( __FILE__ ) . '/Lazyload.i18n.php';

$wgResourceModules['ext.lazyload'] = array(
	'scripts' => array('lazyload.js' ),
	'dependencies' => array( 'mediawiki.hidpi' ),
	'localBasePath' => dirname( __FILE__ ) . '/modules',
	'remoteExtPath' => 'Lazyload/modules'
);

$wgHooks['LinkerMakeExternalImage'][] = function(&$url, &$alt, &$img) {
    global $wgRequest;
    if (defined('MW_API') && $wgRequest->getVal('action') == 'parse') return true;
    $url = preg_replace('/^(http|https):/', '', $url);
    $img = '<span class="external-image" alt="' . htmlentities($alt) . '" data-url="' . htmlentities($url) . '">&nbsp;</span>';
    return false;
};

$wgHooks['ThumbnailBeforeProduceHTML'][] = function($thumb, &$attribs, &$linkAttribs) {
    global $wgRequest;
    if (defined('MW_API') && $wgRequest->getVal('action') == 'parse') return true;
    $attribs['data-url'] = $attribs['src'];
    $attribs['src'] = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    if (isset($attribs['srcset'])) {
        $attribs['data-srcset'] = $attribs['srcset'];
        unset($attribs['srcset']);
    }
    return true;
};

$wgHooks['BeforePageDisplay'][] = function($out, $skin){
	$out->addModules( 'ext.lazyload' );
	return true;
};
