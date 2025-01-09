
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

    loadGrid(){
        const items = this.data;
        if (items){
            console.log("items",items)
            for(var i = 0; i < items.length; i++){
                    this.grid.addRow([
                        items[i].basDt,
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

