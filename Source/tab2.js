
tab2 = class tab2 extends AView
{
	constructor()
	{
		super()
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)      
        this.allItms=[];  
	}

	onInitDone()
	{
		super.onInitDone()
        this.dropBox.setReadOnly(false);
        this.setDropBox();
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)
        this.myStock = JSON.parse(localStorage.getItem('myStock'));

        this.getInterGrp();
        this.grpGrid.clearSelected();

        this.selectedGrp = '';              // 전역 변수로 클릭한 관심 그룹 저장
        this.grpActionType = null;          // 전역 변수로 클릭한 버튼 상태 저장
        this.grpName.element.style.display = 'none'; 
        this.itmsView.element.style.display = 'none';
	}

    /* -------------------------------------------------------- 이벤트 --------------------------------------------------------*/
    // 관심 그룹 선택 시 
	onGrpGridSelect(comp, info, e)
	{
        this.grpName.element.style.display = 'none';
        const index = this.grpGrid.getRowIndexByInfo(info);

        this.selectedGrp = {
            index : index,
            data : this.myStock[index]
        };      // 선택된 그룹 데이터 : 관심 종목 데이터에 보여주기 위해 전역 변수에 저장
        this.itmsView.element.style.display = 'block';
        this.loadItmsGrid();
	}

    // 관심 그룹 '추가' 버튼 클릭 시 
	onAddGrpClick(comp, info, e)
	{
        this.grpGrid.clearSelected();       // 기존 선택 해제
        this.itmsView.element.style.display = 'none';
        this.showGroupInputView('add');     // 그룹 추가 뷰 표시
	}

    // 관심 그룹 '삭제' 버튼 클릭 시 
	onDeleteGrpClick(comp, info, e)
	{
        this.grpName.element.style.display = 'none'; 

        if (!this.grpGrid.getSelectedCells().length) return this.showToast('삭제할 그룹을 먼저 선택하세요!');
        if (this.myStock.length === 1) return this.showToast('관심 그룹은 최소 1개 이상 존재해야 합니다.');
        
        this.showToast("삭제 시 해당 그룹의 종목 정보도 함께 삭제됩니다!!!");
        this.myStock.splice(this.selectedGrp.index, 1);                  // 선택된 그룹의 인덱스를 제거
        localStorage.setItem("myStock", JSON.stringify(this.myStock));   // 로컬 스토리지에 저장
        this.getInterGrp();                                         // 그리드 업데이트
        this.itmsView.element.style.display = 'none';
	}

    // 관심 그룹 '이름 변경' 버튼 클릭 시 
	onModifyGrpClick(comp, info, e)
	{
        if (!this.grpGrid.getSelectedCells().length) {
            this.showToast('변경할 그룹을 먼저 선택하세요!');
            return this.grpName.element.style.display = 'none'; 
        }
        this.showGroupInputView('modify', this.selectedGrp.data.interGrp); // 기존 이름 포함한 수정 뷰 표시
	}

    // 그룹 이름 입력 후 엔터 클릭 시 
    onGroupTextFieldKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onCheckBtnClick();
	}
    
    // 관심 그룹 '확인' 버튼 클릭 시 
	onCheckBtnClick(comp, info, e)
	{
        const actionType = this.grpActionType;
        const groupName = this.groupTextField.getText().trim();

        if (!actionType) return this.showToast('유효하지 않은 동작입니다.');

        // 그룹 이름 중복 확인
        const isDuplicate = this.myStock.some(grp => grp.interGrp === groupName);
        if (isDuplicate) {
            this.showToast("중복된 그룹 이름입니다. 다른 이름을 입력하세요."); 
            this.groupTextField.setFocus();
            return;
        }

        if (actionType === 'add') {
            // 그룹 추가 처리
            if (!groupName) return this.showToast('그룹 이름을 입력하세요.');
            this.myStock.push({ interGrp: groupName, interItms: [] }); // 새로운 그룹 추가
            this.showToast('그룹이 추가되었습니다.');
        } else if (actionType === 'modify') {
            // 그룹 이름 수정 처리
            if (!groupName) return this.showToast('새 이름을 입력하세요.');
            if (this.selectedGrp) {
                this.myStock[this.selectedGrp.index].interGrp = groupName; // 이름 변경
                this.showToast('그룹 이름이 변경되었습니다.');
            } else {
                return this.showToast('수정할 그룹이 선택되지 않았습니다.');
            }
        }

        // 변경된 데이터를 로컬스토리지에 저장
        localStorage.setItem('myStock', JSON.stringify(this.myStock));

        // 뷰 업데이트
        this.grpName.element.style.display = 'none';
        this.getInterGrp();
        
        if (actionType === 'modify') this.grpGrid.selectCell(this.grpGrid.getRow(this.selectedGrp.index));   // 선택 상태 유지
	}

    // 관심 그룹 '취소' 버튼 클릭 시 
    onCancelBtnClick(comp, info, e)
	{
        this.grpName.element.style.display = 'none';
	}

    // 드롭박스 엔터 키 눌렀을 때
	onDropBoxKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onAddItemClick();
	}

    // 관심종목 '추가' 버튼 클릭 시 
	onAddItemClick(comp, info, e)
	{
        const itmsNm = this.dropBox.getEditText().trim();      // 입력한 종목명
        const data = this.getContainerView().allItms;   // 모든 종목명 데이터
        const myStockIndex = this.selectedGrp.index;    // 추가할 그룹의 인덱스

        // 입력값이 data 배열에 존재하는지 확인
        const isValidItem = data.find(item => item.itmsNm === itmsNm);
        if (!isValidItem) {
            this.showToast(`"${itmsNm}"은(는) 올바른 종목명이 아닙니다. 다시 확인해주세요.`);
            return;
        }

        // 이미 추가된 종목인지 확인
        const group = this.myStock[myStockIndex].interItms;
        const isAlreadyAdded = group.some(item => item.itmsNm === itmsNm);
        if (isAlreadyAdded) return this.showToast("이미 관심 종목에 추가되어 있습니다.");

        group.push(                                                             // 새로운 종목 추가
            {srtnCd : isValidItem.srtnCd, itmsNm :isValidItem.itmsNm, mrktCtg :isValidItem.mrktCtg }  
        );

        localStorage.setItem('myStock', JSON.stringify(this.myStock));
        this.dropBox.setEditText('');
        this.getInterGrp();                                                     // 그룹 그리드에 종목 개수 업데이트
        this.grpGrid.selectCell(this.grpGrid.getRow(this.selectedGrp.index));   // 선택 상태 유지
        this.loadItmsGrid();                                                    // 종목 그리드 업데이트
	}

    // 관심종목 '삭제' 버튼 클릭 시 
	onDeleteItmsClick(comp, info, e)
	{

		//TODO:edit here

	}

    // 관심종목 '전체 삭제' 버튼 클릭 시 
	onDeleteItmsAllClick(comp, info, e)
	{

		//TODO:edit here

	}

    /* -------------------------------------------------------- 로직 --------------------------------------------------------*/
    // localStorage에 있는 관심 그룹 가져오기 
    getInterGrp(){
        this.grpGrid.removeAll();
        (this.myStock).forEach(gruopData => {
            let data = `${gruopData.interGrp} ( ${gruopData.interItms.length} )`;
            this.grpGrid.addRow([data]);
        })
    }

    // 그룹 뷰 초기화 로직 - 관심 그룹 추가 및 수정
    showGroupInputView(actionType, groupName = '') {
        this.grpActionType = actionType; // 'add' 또는 'modify' 저장
        this.grpName.element.style.display = 'block'; // 공통 뷰 표시
        this.groupTextField.setFocus();
        this.groupTextField.setText(groupName); // 필요 시 기존 그룹 이름 설정
    }

    // 토스트 보여주는 로직
    showToast(message){
        AToast.single();
        AToast.show(`${message}`);
    }

	// 관심 종목 그리드에 보여주는 로직
    loadItmsGrid(){
        this.deleteView.element.style.display = 'block';        
        this.itmsGrid.removeAll();
        this.itmsGrid.showGridMsg(false);

        const data = this.selectedGrp.data.interItms;
        if (data.length === 0) {
            this.itmsGrid.showGridMsg(true);  // 검색 결과가 없는 경우
            this.deleteView.element.style.display = 'none';
            return;
        }        
        data.forEach(item =>{
            this.itmsGrid.addRow([item.srtnCd, item.itmsNm, item.mrktCtg])
        })
    }


    // 드롭박스에 모든 종목명 추가하는 로직
    setDropBox(){
        const data = this.getContainerView().allItms;
        data.forEach(item => this.dropBox.addItem(`${item.itmsNm}`,`${item.itmsNm}`))
    }

}

