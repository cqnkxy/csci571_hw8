<?php 
$api_key = "d4fa8a29d3784250bf6269e00c75d893";
$url = "";
$host_by_papa = "http://104.198.0.197:8080/";
$sunlight_host = "http://congress.api.sunlightfoundation.com/";
if (isset($_GET["legislators"])){
	$url = "{$host_by_papa}legislators?apikey={$api_key}&per_page=all";
	echo file_get_contents($url);
}elseif (isset($_GET["legislator_details"])){
	$bills = "{$host_by_papa}bills?apikey={$api_key}&sponsor_id={$_GET["bioguide_id"]}";
	$committees = "{$host_by_papa}committees?apikey={$api_key}&member_ids={$_GET["bioguide_id"]}";
	echo "[";
	echo file_get_contents($bills);
	echo ",";
	echo file_get_contents($committees);
	echo "]";
}elseif (isset($_GET["bills"])) {
	$active = "{$host_by_papa}bills?apikey={$api_key}&history.active=true&per_page=50&last_version.urls.pdf__exists=true";
	$new = "{$host_by_papa}bills?apikey={$api_key}&history.active=false&per_page=50&last_version.urls.pdf__exists=true";
	echo "[";
	echo file_get_contents($active);
	echo ",";
	echo file_get_contents($new);
	echo "]";
} elseif (isset($_GET["committees"])) {
	$house = "{$host_by_papa}committees?chamber=house&apikey={$api_key}&per_page=all";
	$senate = "{$host_by_papa}committees?chamber=senate&apikey=d4fa8a29d3784250bf6269e00c75d893&per_page=all";
	$joint = "{$host_by_papa}committees?chamber=joint&apikey={$api_key}&per_page=all";
	echo "[";
	echo file_get_contents($house);
	echo ",";
	echo file_get_contents($senate);
	echo ",";
	echo file_get_contents($joint);
	echo "]";
}
?>