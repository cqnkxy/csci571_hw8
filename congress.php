<?php 
$api_key = "d4fa8a29d3784250bf6269e00c75d893";
$url = "";
if (isset($_GET["legislators"])){
	$url = "https://congress.api.sunlightfoundation.com/legislators?apikey={$api_key}&per_page=all";
} elseif (isset($_GET["bills"])) {
	$url = "https://congress.api.sunlightfoundation.com/bills?apikey={$api_key}&per_page=50";
} elseif (isset($_GET["committees"])) {
	$url = "https://congress.api.sunlightfoundation.com/committees?apikey={$api_key}&per_page=all";
}
echo file_get_contents($url);
?>