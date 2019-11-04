class Queue {
    constructor() {
      this._arr = [];
    }
    enqueue(item) {
      this._arr.push(item);
    }
    dequeue() {
      return this._arr.shift();
    }
    length(){
        return this._arr.length;
    }
    isEmpty(){
        return this._arr.length==0?true:false;
    }
    isElement(data){    //요소가 큐에 있는지 확인
        a=0;
        for(i=0;i<this.length;i++){
            if(this._arr[i]==data){
                a++;
            }
        }
        if(a==0){
            return false;
        }
        else return true;
    }
    putData(item){
        this.enqueue(item);
        if(this._arr.length>4){
            this.dequeue();
        }
    }
}

exports.Queue = Queue;

