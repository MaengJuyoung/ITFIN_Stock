
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
        const invalidChars = /[`~!@#$%^&*()_\-+=\[\]{};:'",<>?\\|/]/;       // 특수문자 검사 
        
        const searchType = thisObj.searchType.getSelectedItemText();
        const searchText = invalidChars.test(thisObj.searchText.getText())? '특수문자' : thisObj.searchText.getText();

        // 탭에 값 넘기기 위해 전역변수에 저장
        thisObj.data.searchType = searchType;
        thisObj.data.searchText = searchText;

        if (thisObj.tab.getSelectedTab().innerText == 'home'){
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
        thisObj.tab.selectTabById(tabId);   

        // 선택된 탭(라벨) 색상 변경
        thisObj.home.element.style.color = (tabId === 'home')? 'blue' : 'black';
        thisObj.my.element.style.color = (tabId === 'my')? 'blue' : 'black';

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

        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&resultType=json&beginBasDt=${beginBasDt}`;
        url += (searchType === '종목명') ? `&likeItmsNm=${searchText}` : `&likeSrtnCd=${searchText}`;

        console.log("url= ",url)
        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                thisObj.updateLabel(result.response.body.totalCount);   // 검색결과에 따라 라벨 처리하는 함수 호출
                thisObj.data.items = result.response.body.items.item;   // result 결과 전역 변수에 저장
                thisObj.addDataAtGrid();                                // 그리드에 데이터 추가하는 함수 호출
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
        
        // 그리드 초기화 
        const grid = tab.view.grid;
        grid.removeAll();         

        // 데이터 추가
        this.data.items.forEach((item) => {
            grid.addRow([       // 기준일자, 종목명, 시장구분, ISIN코드, 법인명, 법인등록번호, 단축코드
                item.basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                item.itmsNm, item.mrktCtg, item.isinCd, item.corpNm, item.crno, item.srtnCd,
            ]);
        });
    }

    // 라벨 업데이트 로직
    updateLabel(totalCount) {
        const thisObj = this;
        if (totalCount === 0){                              // 특수문자 입력 및 조회 데이터 없을 경우 라벨 표시 
            (thisObj.data.searchText === '특수문자')? thisObj.label.setText("특수문자는 입력할 수 없습니다.") : thisObj.label.setText("검색된 데이터가 없습니다.");
            thisObj.label.element.style.display = 'block';
        } else thisObj.label.element.style.display = 'none'; // 조회 데이터 있을 경우 라벨 없애고 그리드에 데이터 추가
    }
}

