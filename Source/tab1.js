
tab1 = class tab1 extends AView
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
        //console.log("getContainerView",this.getContainerView());
        this.data = this.getContainerView().data;
        this.numOfRows.selectItemByValue(0);


	}

	onInitDone()
	{
		super.onInitDone()

		//TODO:edit here
        //this.loadGrid();

	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)
		//TODO:edit here

	}

    

    // 조회 버튼 클릭 시 
	onTabBtnClick(comp, info, e)
	{
        const thisObj = this;

        const beginBasDt = thisObj.beginBasDt.getSelectBtn();
        const mrktCtg = thisObj.mrktCtg.getSelectBtn();
        const numOfRows = thisObj.numOfRows.selectItemByValue();
        
        getItemInfo()
	}

    // API 통신 로직
    getItemInfo(searchType='', searchText=''){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const beginBasDt = '20250101';  // 기준일자; 기준일자가 검색값보다 크거나 같은 데이터를 검색 

        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&resultType=json&beginBasDt=${beginBasDt}`;
        if (searchType == '종목명'){
            url += `&likeItmsNm=${searchText}`;
        }else if (searchType == '종목코드'){
            url += `&likeSrtnCd=${searchText}`;
        }

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                thisObj.data = result.response.body.items.item;
                if (thisObj.tab.getSelectedTab()){  
                    const tabId = thisObj.tab.getSelectedTab().innerText;
                    thisObj.addDataAtGrid(tabId);

                }
            },
            error: function(error){
                console.error(error);
            }
        })
    }

    // 그리드에 데이터 추가 로직
    addDataAtGrid(){
        const items = this.data;
        if (items){
            console.log("items",items)
            for(var i = 0; i < items.length; i++){
                    this.grid.addRow([
                        items[i].basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                        items[i].itmsNm,
                        items[i].mrktCtg,
                        items[i].isinCd,
                        items[i].corpNm,
                        items[i].crno,
                        items[i].srtnCd
                    ])
                }
        }
    }
}

