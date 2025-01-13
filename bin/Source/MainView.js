
MainView = class MainView extends AView
{
	constructor()
	{
		super()
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        this.data = {};
        this.contiKey = '';
        this.getItemInfo();
        this.home.element.style.color = 'blue';
        this.label.element.style.display = 'none';
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
        // const searchText = thisObj.searchText.getText();
        // 입력값 URL 인코딩
        // const searchType = encodeURIComponent(thisObj.searchType.getSelectedItemText());
        const searchText = encodeURIComponent(thisObj.searchText.getText());

        const tabId = thisObj.tab.getSelectedTab().innerText;
        if (tabId == 'home'){
            // home에 전달하기 위한 전역 변수 저장
            thisObj.data.searchType = searchType;
            thisObj.data.searchText = searchText;
            
            thisObj.getItemInfo(searchType, searchText);
        }
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

        if (tabId == thisObj.home.compId){
            comp.element.style.color = 'blue';
            thisObj.my.element.style.color = 'black';
        }else {
            comp.element.style.color = 'blue';
            thisObj.home.element.style.color = 'black';
        }


        thisObj.tab.selectTabById(tabId);   

        // 검색창 초기화
        thisObj.searchText.setText('');
        thisObj.data.searchType = '';
        thisObj.data.searchText = '';

        if (tabId == 'home') thisObj.getItemInfo();
        
	}

    // API 통신 로직
    getItemInfo(searchType='', searchText=''){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const beginBasDt = '20241101';
        console.log("searchType",searchType)

        console.log("searchText",searchText)

        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&resultType=json&beginBasDt=${beginBasDt}`;
        if (searchType == '종목명'){
            url += `&likeItmsNm=${searchText}`;
        }else if (searchType == '종목코드'){
            url += `&likeSrtnCd=${searchText}`;
        }
        console.log("url",url)


        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                console.log("result",result)
                console.log("result.response",result.response)
                if(result.response !== undefined){  // `, % 등 입력하였을 경우 
                    if (result.response.body.totalCount == 0) thisObj.label.element.style.display = 'block';
                    else thisObj.label.element.style.display = 'none';
                    
                    thisObj.data.items = result.response.body.items.item;
                    if (thisObj.tab.getSelectedTab()){  
                        thisObj.addDataAtGrid();
                    }
                }else {
                    thisObj.label.element.style.display = 'block';
                    thisObj.addDataAtGrid();
                }
            },
            error: function(error){
                console.error(error);
            }
        })
    }

    // 그리드에 데이터 추가 로직
    addDataAtGrid(){
        const thisObj = this;

        const tab = thisObj.tab.getSelectedTab();
        // home에서 그리드 로드 시, 기본값 설정
        const homeTab = tab.view;
        homeTab.beginBasDt.selectBtnByValue(0);
        homeTab.numOfRows.selectItemByValue(100);
        homeTab.contiKey.element.style.display = 'block';
        homeTab.label.element.style.display = 'none';
        
        const grid = tab.view.grid;
        grid.removeAll();           
        const items = thisObj.data.items;
        console.log("items",items)
        for(var i = 0; i < items.length; i++){
            grid.addRow([   // 기준일자, 종목명, 시장구분, ISIN코드, 법인명, 법인등록번호, 단축코드
                items[i].basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), 
                items[i].itmsNm, items[i].mrktCtg, items[i].isinCd, items[i].corpNm, items[i].crno, items[i].srtnCd 
            ])
        }
    }
}

