/*
			<div class="col-xs-12">
				<label class="" for=>パラメータ</label>
				<div class="row">
					<div class="col-xs-12 col-md-6">
						<div class="col-xs-4 col-md-2">単語重複</div>
						<div class="col-xs-4 col-md-2">
							<label class="radio-inline"><input type="radio" name="duplication" value="true" checked="checked">あり</label>
						</div>
						<div class="col-xs-4 col-md-2">
							<label class="radio-inline"><input type="radio" name="duplication" value="false"  checked="checked">なし</label>
						</div>

					</div>
				</div>
				<div class="row">
					<div class="input-param col-xs-12 col-sm-6">
						<div class="col-xs-3 col-sm-2" style="text-align:right">母音</div>
						<div class="col-xs-6 col-sm-7">
							<input type="range" class="form-control form-control-range ipt-parameter" name="vowel" min="0" max="100" step="1" value="50">
						</div>
						<div class="col-xs-1 param-value">50</div>
					</div>
					<div class="input-param col-xs-12 col-sm-6">
						<div class="col-xs-3 col-sm-2" style="text-align:right">子音</div>
						<div class="col-xs-6 col-sm-7">
							<input type="range" class="form-control form-control-range ipt-parameter" name="consonant" min="0" max="100" step="1" value="10">
						</div>
						<div class="col-xs-1 param-value">10</div>
					</div>
					<div class="input-param col-xs-12 col-sm-6">
						<div class="col-xs-3 col-sm-2" style="text-align:right">文節</div>
						<div class="col-xs-6 col-sm-7">
							<input type="range" class="form-control form-control-range ipt-parameter" name="phrasebreak" min="0" max="100" step="1" value="20">
						</div>
						<div class="col-xs-1 param-value">20</div>
					</div>
					<div class="input-param col-xs-12 col-sm-6">
						<div class="col-xs-3 col-sm-2" style="text-align:right">単語数</div>
						<div class="col-xs-6 col-sm-7">
							<input type="range" class="form-control form-control-range ipt-parameter" name="wordnum" min="0" max="100" step="1" value="10">
						</div>
						<div class="col-xs-1 param-value">10</div>
					</div>
				</div>
			</div>
			<div class="col-xs-12">
				<textarea class="form-control ipt-word" maxlength="10000" rows="10" placeholder="変換したい文章(1万文字以内)"></textarea>
				<button class="btn btn-block btn-primary btn-send">Convert</button>
			</div>
		</div>

 */

const SettingPublic = (function(){
	const WordListSetting = (function(){
		const areaOuter = $("<div class='row form-group radio-wordlist'></div>");
		const area = $("<div class='col-xs-12'></div>");
		area.appendTo(areaOuter);
		const label = $('<label class="" for=>単語リストの種類</label>');
		label.appendTo(label);
		const areaFile = $('<div class="radio-file">');
		areaFile.appendTo(area);
		const areaOriginal = $('<div></div>');
		areaOriginal.appendTo(area);
		
		//areaFileの設定
		const baseLabel = (value,name)=>{
			const lab = $('<label class="radio-inline"><input type="radio" value="'+value+'" name="wordfile">'+name+'</label>');
			return lab;
		}
		baseLabel('BASEBALL','野球選手').appendTo(areaFile);
		area.find("input").last().prop("checked",true);
		baseLabel('STATION','駅名').appendTo(areaFile);
		baseLabel('NATION','国名').appendTo(areaFile);
		baseLabel('SEKITSUI','動物').appendTo(areaFile);
		baseLabel('POKEMON','ポケモン').appendTo(areaFile);
		baseLabel('PHYSICIST','物理学者').appendTo(areaFile);
		
		//areaOriginalの設定
		const labelOriginal = baseLabel("ORIGINAL","自作の単語リストを使用");
		labelOriginal.appendTo(areaOriginal);
		labelOriginal.addClass("radio-original");
		
		return {
			appendTo: element=>area.appendTo(element)
		}
	})();
	
	const DuplicationSetting = (function(){
		const area = $('<div class="row"></div>');
		$('<div class="col-xs-4 col-md-2">単語重複</div>').appendTo(area);
		(function(){
			const div = $('<div class="col-xs-4 col-md-2">');
			const lab = $('<label class="radio-inline"><input type="radio" name="duplication" value="true" checked="checked">あり</label>');
			lab.appendTo(div);
			div.appendTo(area);
		})();
		(function(){
			const div = $('<div class="col-xs-4 col-md-2">');
			const lab = $('<label class="radio-inline"><input type="radio" name="duplication" value="false" checked="checked">なし</label>');
			lab.appendTo(div);
			div.appendTo(area);
		})();
		return {
			appendTo: element => area.appendTo(element)
		}
	})();
	
	const ParameterSetting = (function(){
		
		const area = $('<div class="row"></div>');
		//baseのinput。title,name,min,max,step,valueはあとから設定
		const baseInput = (title='none') => {
			const area = $('<div class="input-param col-xs-12 col-sm-6"></div>');
			const areaTitle = $('<div class="col-xs-3 col-sm-2" style="text-align:right">'+title+'</div>');
			areaTitle.appendTo(area);
			const areaInput = $('<div class="col-xs-6 col-sm-7"></div>');
			areaInput.appendTo(area);
			const input = $('<input type="range" class="form-control form-control-range ipt-parameter" name="phrasebreak" min="0" max="100" step="1" value="20">');
			input.appendTo(areaInput);
			const areaValue = $('<div class="col-xs-1 param-value">20</div>');
			areaValue.appendTo(area);
			return {
				appendTo: element=>area.appendTo(element),
				setParam: param=>{
					let key;
					key = 'title';
					if(key in param)areaTitle.html(param[key]);
					key='value';
					if(key in param){
						input.attr(key,param[key]);
						areaValue.html(param[key]);
					}
					for(let v in ['min','max','step','name']){
						if(v in param)input.attr(v,param[v]);						
					}
				}
			}
		}
		
		const inputVowel = baseInput("母音");
		inputVowel.appendTo(area);
		inputVowel.setParam({min:0,max:100,step:1,value:50,name:"vowel"});
		const inputConsonant = baseInput("子音");
		inputConsonant.appendTo(area);
		inputConsonant.setParam({min:0,max:100,step:1,value:10,name:"consonant"});
		const inputBreak = baseInput("文節");
		inputBreak.appendTo(area);
		inputBreak.setParam({min:0,max:100,step:1,value:20,name:"phrasebreak"});
		const inputWordnum = baseInput("単語数");
		inputWordnum.appendTo(area);
		inputWordnum.setParam({min:0,max:100,step:1,value:10,name:"phrasebreak"});
		
		return {
			appendTo: element=>area.appendTo(element)
		}
	})();
	
	
	
	const Converter = (function(){
		const area = $('<div class="row"></div>');
		const div = $('<div class="col-xs-12"></div>');
		div.appendTo(area);
		const input = $('<textarea class="form-control ipt-word" maxlength="10000" rows="10" placeholder="変換したい文章(1万文字以内)"></textarea>');
		input.appendTo(div);
		const button = $('<button class="btn btn-block btn-primary btn-send">Convert</button>');
		button.appendTo(div);
		return {
			appendTo: element=>area.appendTo(element)
		}
	})();
	
	const Display = (function(){
		const area = $('<div class="row"></div>');
		const lab = $('<div class="col-xs-12">出力結果(上から、入力読み,出力読み,出力元単語)</div>');
		lab.appendTo(area);
		const progress = $("<span class='span-progress'>0/0</span>");
		const loading = $('<span class="loading2"><span>Converting...</span><img src="gif/ajax-loader.gif"></span>');
		loading.find("img").before(progress);
		loading.appendTo(area);
		const areaResult = $('<div class="col-xs-12 div-result"></div>');
		areaResult.appendTo(area);
		return {
			appendTo: element=>area.appendTo(element)
		}
	})();
	
	
	const area=$("<div></div>");
	WordListSetting.appendTo(area);
	DuplicationSetting.appendTo(area);
	ParameterSetting.appendTo(area);
	Converter.appendTo(area);
	Display.appendTo(area);
	return {
		appendTo: element=>area.appendTo(element)
	}
})();

(function(){
	const area = $(".area-setting");
	SettingPublic.appendTo(area);
})();