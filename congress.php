<?php 
$api_key = "d4fa8a29d3784250bf6269e00c75d893";
$url = "";
if (isset($_GET["legislators"])){
	$url = "https://congress.api.sunlightfoundation.com/legislators?apikey={$api_key}&per_page=all";
	echo file_get_contents($url);
}elseif (isset($_GET["legislator_details"])){
	$bills = "https://congress.api.sunlightfoundation.com/bills?apikey={$api_key}&sponsor_id={$_GET["bioguide_id"]}";
	$committees = "https://congress.api.sunlightfoundation.com/committees?apikey={$api_key}&member_ids={$_GET["bioguide_id"]}";
	echo "[";
	echo file_get_contents($bills);
	echo ",";
	echo file_get_contents($committees);
	echo "]";
}elseif (isset($_GET["bills"])) {
	$active = "https://congress.api.sunlightfoundation.com/bills?apikey={$api_key}&history.active=true&per_page=50";
	$new = "https://congress.api.sunlightfoundation.com/bills?apikey={$api_key}&history.active=false&per_page=50";
	echo "[";
	echo file_get_contents($active);
	echo ",";
	echo file_get_contents($new);
	echo "]";
} elseif (isset($_GET["committees"])) {
	$house = "https://congress.api.sunlightfoundation.com/committees?chamber=house&apikey={$api_key}&per_page=all";
	$senate = "https://congress.api.sunlightfoundation.com/committees?chamber=senate&apikey=d4fa8a29d3784250bf6269e00c75d893&per_page=all";
	$joint = "https://congress.api.sunlightfoundation.com/committees?chamber=joint&apikey={$api_key}&per_page=all";
	echo "[";
	echo file_get_contents($house);
	echo ",";
	echo file_get_contents($senate);
	echo ",";
	echo file_get_contents($joint);
	echo "]";
}
?>