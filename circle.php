<?php
header('Content-type:text/json');
$num=$_GET['n'];
echo '{"name":0,"children":[{"name":1,"children":[{"children":[{"children":[{"children":[{"children":[{"children":[{"children":[{"children":[{}]}]}]}]}]}]}]}]}';
for($i=2;$i<=$num;++$i){
	echo ',{"name":';
	echo $i;
	echo ',"children":[{"children":[{"children":[{"children":[{"children":[{"children":[{"children":[{"children":[{}]}]}]}]}]}]}]}]}';
}
echo ']}';
?>
