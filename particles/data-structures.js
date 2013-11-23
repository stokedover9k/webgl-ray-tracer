
//============================================//
//            LIST (RECURSIVE)                //
//============================================//

function List (val, tail) {
  this.val = val;
  this.tail = tail;
}

var NIL = new List(null, null);

List.prototype.filter = function(pred) {
  if( this == NIL )
    return NIL;
  else if( pred(this.val) )
    return new List(this.val, this.tail.filter(pred));
  else
    return this.tail.filter(pred);
};

List.prototype.foreach = function(func) {
  for(var l = this; l != NIL; l = l.tail )
    func(l.val);
};

List.prototype.size = function(counter) {
  if( this == NIL )
    return 0;
  else
    return 1 + this.tail.size();
};
