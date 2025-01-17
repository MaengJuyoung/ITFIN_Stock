
MainView = class MainView extends AView
{
	constructor()
	{
		super()
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        this.data = {
            searchType : '',
            searchText : '',
            pageNo : 1
        };
        this.allItms = [];
        this.contiKey = '';
        this.getItemInfo();
        this.getAllItms();
        this.home.element.style.color = 'blue';
	}

	onInitDone()
	{
		super.onInitDone()

        // 메인에서 이벤트를 수신하여 스크롤 처리
        window.addEventListener('scrollToBottom', (event) => {
            window.scrollTo({   
                top: 600,
                behavior: 'smooth'
            });
        });
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)
        
        // localStorage에서 'myStock' 값을 가져오고, 없다면 기본값 설정
        let myStock = JSON.parse(localStorage.getItem('myStock'));
        if (!myStock) {
            // 데이터가 없다면 기본값으로 설정
            myStock = [
                {
                    interGrp: "관심그룹 1",
                    interItms: [] // 관심 종목
                }
            ];
            // 로컬스토리지에 기본값 저장
            localStorage.setItem('myStock', JSON.stringify(myStock));
        }
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
        thisObj.data.pageNo = 1;

        this.selectTab('home', true);
	}

    // 검색창 입력 후 엔터 클릭 시 
    onSearchTextKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onSearchClick();
	}

    // 로고 클릭 시 
	onLogoClick(comp, info, e)
	{
        this.selectTab('home');
	}

    // 탭 메뉴 클릭 시 
	onTabClick(comp, info, e)
	{
        this.selectTab(comp.compId);       
        this.getAllItms();
	}

    // 탭 선택 시 초기화 로직
    selectTab(tabId, search=false)
    {
        const thisObj = this;
        thisObj.tab.selectTabById(tabId);   
        
        // 선택된 탭(라벨) 색상 변경
        thisObj.home.element.style.color = (tabId === 'home')? 'blue' : 'black';
        thisObj.my.element.style.color = (tabId === 'my')? 'blue' : 'black';

        if (search){
            thisObj.getItemInfo(thisObj.data.searchType, thisObj.data.searchText);
        }else {
            // 검색창 초기화
            thisObj.searchText.setText('');
            thisObj.data.searchType = '';
            thisObj.data.searchText = '';
            if (tabId == 'home') {
                thisObj.getItemInfo();
            }
        }
    }

    // API 통신 로직
    getItemInfo(searchType='', searchText=''){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const beginBasDt = '20241101';

        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&resultType=json&beginBasDt=${beginBasDt}`;
        url += (searchType === '종목명') ? `&likeItmsNm=${searchText}` : `&likeSrtnCd=${searchText}`;

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                thisObj.data.items = result.response.body.items.item;   // result 결과 전역 변수에 저장
                thisObj.getTabData();                                   // 그리드에 데이터 추가하는 함수 호출
            },
            error: function(error){
                console.error(error);
            }
        })
    }

    // home 탭 뷰 데이터 가져오는 로직
    getTabData(){
        const thisObj = this;
        const tab = thisObj.tab.getSelectedTab().view;
        this.addDataAtGrid(tab);
    }

    // 그리드에 데이터 추가 로직
    addDataAtGrid(tab){
        // 기본값 설정
        tab.beginBasDt.selectBtnByValue(0);
        tab.numOfRows.selectItemByValue(100);
        tab.contiKey.element.style.display = 'block';
        
        // 그리드 초기화 
        const grid = tab.grid;
        grid.removeAll(); 
        grid.showGridMsg(false);

        if (this.data.searchText === '특수문자') AToast.show("특수문자는 입력할 수 없습니다.");     // 특수문자 포함된 경우
        if (this.data.items.length === 0) return grid.showGridMsg(true);                           // 검색 결과가 없는 경우
        
        grid.scrollToTop();                     // 스크롤 맨 위로             
        this.data.items.forEach((item) => {     // 데이터 추가
            grid.addRow([       // 기준일자, 종목명, 시장구분, ISIN코드, 법인명, 법인등록번호, 단축코드
                item.basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                item.itmsNm, item.mrktCtg, item.isinCd, item.corpNm, item.crno, item.srtnCd,
            ]);
        });
    }

    // 모든 종목명 가져오는 로직
    getAllItms(){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=2700&resultType=json`;

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){ thisObj.allItms = result.response.body.items.item; },
            error: function(error){ console.error(error);}
        })
    }
}

