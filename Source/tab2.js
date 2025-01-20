
tab2 = class tab2 extends AView
{
	constructor()
	{
		super()
        AToast.single();
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)      
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
        
        this.updateGrpGrid();
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

        this.selectedGrp = {         // 선택된 그룹 데이터 : 관심 종목 데이터에 보여주기 위해 전역 변수에 저장
            index : index,
            data : this.myStock[index]
        };     
        this.itmsView.element.style.display = 'block';
        this.updateItmsGrid();
	}

    // 관심 그룹 '추가' 버튼 클릭 시 
	onAddGrpClick(comp, info, e)
	{
        this.itmsView.element.style.display = 'none';
        this.grpGrid.clearSelected();       // 기존 선택 해제
        this.showGroupInputView('add');     // 그룹 추가 뷰 표시
	}

    // 관심 그룹 '삭제' 버튼 클릭 시 
	onDeleteGrpClick(comp, info, e)
	{
        this.grpName.element.style.display = 'none'; 

        if (!this.grpGrid.getSelectedCells().length) return this.showToast('삭제할 그룹을 먼저 선택하세요!');
        if (this.myStock.length === 1) return this.showToast('관심 그룹은 최소 1개 이상 존재해야 합니다.');
        
        this.showToast("삭제 시 해당 그룹의 종목 정보도 함께 삭제됩니다!!!");
        this.myStock.splice(this.selectedGrp.index, 1);                 // 선택된 그룹의 인덱스를 제거
        this.setMyStock();
        this.updateGrpGrid();                                           
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

        // 그룹 추가 or 수정 및 업데이트
        this.setMyStock();
        this.grpName.element.style.display = 'none';
        this.updateGrpGrid();
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
        const itmsNm = this.dropBox.getEditText().trim();                                   // 입력한 종목명
        const { isValid, isDuplicate } = this.isValidItem(itmsNm, this.selectedGrp.index);  // 유효성 및 중복 여부 확인

        if (!isValid) return this.showToast(`"${itmsNm}"은(는) 올바른 종목명이 아닙니다. 다시 확인해주세요.`);
        if (isDuplicate) return this.showToast("이미 관심 종목에 추가되어 있습니다.");

        const group = this.myStock[this.selectedGrp.index].interItms;
        group.push({srtnCd : isValid.srtnCd, itmsNm, mrktCtg :isValid.mrktCtg });           // 새로운 종목 추가
        this.dropBox.setEditText('');
        this.refreshGrids();                                   
	}

    // 관심종목 '삭제' 버튼 클릭 시 
	onDeleteItmsClick(comp, info, e)
	{
        const selectedItems = this.itmsGrid.getSelectedCells();
        if (!selectedItems.length) return this.showToast('삭제할 종목을 먼저 선택하세요!');
        
        const myStockIndex = this.selectedGrp.index;        // 현재 그룹 인덱스
        const group = this.myStock[myStockIndex].interItms; // 현재 그룹의 관심 종목 리스트

        // 선택된 항목들의 인덱스를 가져오고 정렬(역순 정렬 필요)
        const selectedIndexes = selectedItems
            .map(item => this.itmsGrid.indexOfRow(item))    // 각 선택 항목의 인덱스 추출
            .sort((a, b) => b - a);                         // 내림차순 정렬

        // 선택된 인덱스를 역순으로 순회하며 삭제
        selectedIndexes.forEach(index => {
            group.splice(index, 1);                         // 해당 인덱스에서 항목 삭제
        });
        this.refreshGrids();                                      
	}

    // 관심종목 '전체 삭제' 버튼 클릭 시 
	onDeleteItmsAllClick(comp, info, e)
	{
        this.myStock[this.selectedGrp.index].interItms = [];
        this.refreshGrids(); 
	}

    /* -------------------------------------------------------- 로직 --------------------------------------------------------*/
    // 관심 그룹을 업데이트하는 로직 
    updateGrpGrid(){
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
        AToast.show(message);
    }

	// 관심 종목을 업데이트하는 로직
    updateItmsGrid(){
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

    // 관심 종목 유효성 및 중복 여부 확인하는 로직
    isValidItem(itemName, groupIndex) {
        const data = this.getContainerView().allItms;
        const group = this.myStock[groupIndex].interItms;

        const isValid = data.find(item => item.itmsNm === itemName);
        const isDuplicate = group.some(item => item.itmsNm === itemName);
        return { isValid, isDuplicate };
    }

    // 관심종목 추가 및 삭제 후 데이터 불러오는 로직
    refreshGrids(){
        this.setMyStock();
        this.updateGrpGrid();                                                   // 그룹 그리드에 종목 개수 업데이트
        this.grpGrid.selectCell(this.grpGrid.getRow(this.selectedGrp.index));   // 선택 상태 유지
        this.updateItmsGrid();        
    }

    // 로컬 스토리지에 데이터 저장하는 로직
    setMyStock() {
        localStorage.setItem('myStock', JSON.stringify(this.myStock));
    }
}

