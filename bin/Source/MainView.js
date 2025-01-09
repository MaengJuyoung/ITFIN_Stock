
MainView = class MainView extends AView
{
	constructor()
	{
		super()
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        this.data = '';
        this.contiKey = '';
        this.getItemInfo();
	}

	onInitDone()
	{
		super.onInitDone()
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)
	}

    // 검색 버튼 클릭 시 
	onSearchClick(comp, info, e)
	{
        const thisObj = this;
        const searchType = thisObj.searchType.getSelectedItemText();
        const searchText = thisObj.searchText.getText();

        thisObj.getItemInfo(searchType,searchText);
	}

    // 검색창 입력 후 엔터 클릭 시 
    onSearchTextKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onSearchClick();
	}

    // 탭 메뉴 선택 시 
	onTabClick(comp, info, e)
	{
        const thisObj = this;
        const tabId = comp.compId;

        thisObj.tab.selectTabById(tabId);   

        console.log("thisObj.tab.getSelectedView()",);

        if (tabId == 'home'){
            const homeTab = thisObj.tab.getSelectedView();
            homeTab.beginBasDt.selectBtnByValue(0);
            homeTab.mrktCtg.selectBtnByValue(0);

        }
        //this.beginBasDt.selectBtnByValue(0);
        //this.mrktCtg.selectBtnByValue(0);

        thisObj.addDataAtGrid(tabId);
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
    addDataAtGrid(tabId, contiKey=''){
        const thisObj = this;

        const tab = this.tab.getSelectedTab();
        

        if (tabId == 'home'){
            const grid = tab.view.grid;
            grid.removeAll();           // contiKey 받지 않을 시에만
            const items = thisObj.data;
            //console.log("items",items)
            for(var i = 0; i < items.length; i++){
                grid.addRow([   // 기준일자, 종목명, 시장구분, ISIN코드, 법인명, 법인등록번호, 단축코드
                    items[i].basDt, items[i].itmsNm, items[i].mrktCtg, items[i].isinCd, items[i].corpNm, items[i].crno, items[i].srtnCd 
                ])
            }
        }
    }
}

