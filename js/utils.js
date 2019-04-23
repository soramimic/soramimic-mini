function ld_outer(cost){
	function ld_inner(s,t){
		score = 0;
		zip(s,t).forEach(function([v1,v2]){
			score+=cost[v1][v2]
		});
		return score;
	}
}
const zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);

