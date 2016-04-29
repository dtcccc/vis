<?php
header('Content-type:text/json');
$path = "data.tsv";
$data = ["name"=>10,"children"=>[]];
$flag = false;
$fp = fopen($path,'r');
$str = fgets($fp); 
$i = [0,0];
while (!feof($fp)) {
    $str = fgets($fp);     
    $pieces = explode("\t", $str);
    $ips = explode(".", $pieces[1]);
	foreach($data["children"] as $k=>$v)
		if($v["name"]==$ips[0].'.'.$ips[1]){
			$flag=true;
			$i[0]=$k;
			break;
		}
	if(!$flag){
		$data["children"][]=["name"=>$ips[0].'.'.$ips[1],"children"=>[]];
		$i[0] = sizeof($data["children"])-1;
	}
	$flag = false;
	foreach($data["children"][$i[0]]["children"] as $k=>$v)
		if($v["name"]==$ips[0].'.'.$ips[1].'.'.$ips[2]){
			$flag=true;
			$i[1]=$k;
			break;
		}
	if(!$flag){
		$data["children"][$i[0]]["children"][]=["name"=>$ips[0].'.'.$ips[1].'.'.$ips[2],"children"=>[]];
		$i[1] = sizeof($data["children"][$i[0]]["children"])-1;
	}
	$flag = false;
	foreach($data["children"][$i[0]]["children"][$i[1]]["children"] as $k=>$v)
		if($v["name"]==$pieces[1]){
			$flag=true;
			break;
		}
	if(!$flag){
		$data["children"][$i[0]]["children"][$i[1]]["children"][]=["name"=>$pieces[1]];
	}
}              
echo json_encode($data);
?>