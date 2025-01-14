
interItms = class interItms extends AView
{
	constructor()
	{
		super()
        this.data = null; 
		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        const myStock = JSON.parse(localStorage.getItem('myStock'));
        myStock.forEach(interGrps => {
            this.interGrp.addItem(interGrps.interGrp);
        })
		//TODO:edit here

	}

	onInitDone()
	{
		super.onInitDone()
        this.data = this.getContainer().data;

        this.itmsNm.setText(this.data.itmsNm);
        this.mrktCtg.setText(this.data.mrktCtg);
        this.srtnCd.setText(this.data.srtnCd);
		//TODO:edit here

	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}

    // 닫기 버튼 클릭 시 
	onCloseBtnClick(comp, info, e)
	{
        this.getContainer().close();
	}

    // MY STOCK 추가 버튼 클릭 시 
    onAddBtnClick(comp, info, e)
    {
        const thisObj = this;
        const myStock = JSON.parse(localStorage.getItem('myStock'));

        // 선택된 그룹의 인덱스 가져오기
        const index = thisObj.interGrp.getSelectedIndex();
        const group = myStock[index].interItms;

        
        if (group.includes(this.data.itmsNm)) {  // 이미 저장되어 있는지 확인
            return alert("이미 관심 종목에 추가되어 있습니다.");
        }

        group.push(this.data.itmsNm);

        // 업데이트된 데이터를 다시 저장
        localStorage.setItem("myStock", JSON.stringify(myStock));
        alert("관심 종목에 추가되었습니다!");
        this.getContainer().close();
    }

}

