<?php 
$api_key = "d4fa8a29d3784250bf6269e00c75d893";
$url = "";
if (isset($_GET["legislators"])){
	$url = "https://congress.api.sunlightfoundation.com/legislators?apikey={$api_key}&per_page=all";
	echo file_get_contents($url);
}elseif (isset($_GET["legislator_details"])){
	$url1 = "https://congress.api.sunlightfoundation.com/bills?apikey={$api_key}&sponsor_id={$_GET["bioguide_id"]}";
	$url2 = "https://congress.api.sunlightfoundation.com/committees?apikey={$api_key}&member_ids={$_GET["bioguide_id"]}";
	echo "[";
	echo file_get_contents($url1);
	echo ",";
	echo file_get_contents($url2);
	echo "]";
}elseif (isset($_GET["bills"])) {
	$url = "https://congress.api.sunlightfoundation.com/bills?apikey={$api_key}&per_page=50";
} elseif (isset($_GET["committees"])) {
	$url = "https://congress.api.sunlightfoundation.com/committees?apikey={$api_key}&per_page=all";
}
?>