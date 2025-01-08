
MainView = class MainView extends AView
{
	constructor()
	{
		super()

		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		//TODO:edit here
        this.data = '';
        // this.getItemInfo();

	}

	onInitDone()
	{
		super.onInitDone()

		//TODO:edit here
        
        
        


	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}

    getItemInfo(searchType='', searchText=''){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        
        // stdt = '2024',  // 조회시작년도 
        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&resultType=json`;


        console.log("searchType",searchType)
        if (searchType == '종목명'){
            url += `&likeItmsNm=${searchText}`;
        }else if (searchType == '종목코드'){
            url += `&likeSrtnCd=${searchText}`;
        }else {
            url += `&likeSrtnCd=${searchText}&likeItmsNm=${searchText}`;
        }

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                thisObj.data = result.response.body.items.item;
                console.log("url=",url);

                console.log("result=",thisObj.data);

            },
            error: function(error){
                console.error(error);
            }
            
        })
        
    }



	onTabClick(comp, info, e)
	{
        const thisObj = this;
        const tabId = comp.compId;

        thisObj.tab.selectTabById(tabId);
        console.log("탭 id = ",tabId);


        const tab = this.tab.getSelectedTab();
        

        if (tabId == 'home'){
            const grid = tab.view.grid;
            const items = thisObj.data;
            console.log("items",items)
            for(var i = 0; i < items.length; i++){
                grid.addRow([
                    items[i].basDt,     // 기준일자
                    items[i].itmsNm,    // 종목명
                    items[i].mrktCtg,   // 시장구분
                    items[i].isinCd,    // ISIN코드
                    items[i].corpNm,    // 법인명
                    items[i].crno,      // 법인등록번호
                    items[i].srtnCd     // 단축코드
                ])
            }
        }

	}



	onSearchClick(comp, info, e)
	{
        const thisObj = this;
        const searchType = thisObj.searchType.getSelectedItemText();
        const searchText = thisObj.searchText.getText();

        thisObj.getItemInfo(searchType,searchText);
	}
}

