/**
 * Make element draggable
 * @param {HTMLElement} element
 * @param {string} parentSelector
 * @param {string} cardSelector
 * @param {string} underCardSelector
 * @param {string} parentScrollableSelector
 * @param {number=} threshold
 */
function makeDraggable (element, parentSelector, cardSelector, underCardSelector, parentScrollableSelector, threshold) {
    threshold = threshold || 0.3;

    let $cardsWrapper = element.querySelectorAll(parentSelector);

    // console.log("cardSelector", cardSelector);

    $cardsWrapper.forEach(($cardWrapper) => {
        /** @type {NodeListOf<HTMLElement>} */
        let $underCard = $cardWrapper.querySelectorAll(underCardSelector);

        // если есть под карточкой скрытые подменю то инитим драг
        if ($underCard.length > 0) {
            /** @type {HTMLElement} */
            let $card = typeof cardSelector === "string" ? $cardWrapper.querySelector(cardSelector) : cardSelector;

            Draggable.create($card, {
                type: "x",
                edgeResistance: 1,
                minimumMovement: 10,
                throwProps: true,
                onDragStart: function () {
                    // let $parentScrollableWrapper = typeof parentScrollableSelector === "string" ? element.closest(parentScrollableSelector) : null;
                    //
                    // if($parentScrollableWrapper) {
                    //     $parentScrollableWrapper.style.overflow = 'hidden';
                    // }
                },
                onDragEnd: function () {
                    if (Math.abs(this.endX - this.startX) < ($card.offsetWidth * threshold)) {
                        TweenMax.to(this.target, 0.2, {x: 0});
                    } else {
                        TweenMax.to(this.target, 0.2, {
                            x: this.endX > this.startX ? "110%" : "-110%",
                            onComplete: function () {
                                TweenMax.set(this.target, { x : "0%", zIndex: 999 });
                                TweenMax.set($underCard, { zIndex: 1000 });
                            }.bind(this)
                        });
                    }

                    // let $parentScrollableWrapper = typeof parentScrollableSelector === "string" ? element.closest(parentScrollableSelector) : null;
                    //
                    // if($parentScrollableWrapper) {
                    //     $parentScrollableWrapper.style.overflow = 'auto';
                    // }
                }
            });
        }
    });
}


/**
 * Make element draggable
 * @param {HTMLElement} element
 * @param {string} parentSelector
 * @param {string} cardSelector
 * @param {string} underCardSelector
 * @param {string} parentScrollableSelector
 * @param {number=} threshold
 */
function makeDraggablePair (element, parentSelector, cardSelector, underCardSelector, threshold) {
    threshold = threshold || 0.3;

    let $cardsWrapper = element.querySelectorAll(parentSelector);

    // console.log("cardSelector", cardSelector);

    $cardsWrapper.forEach(($cardWrapper) => {
        /** @type {NodeListOf<HTMLElement>} */
        let $underCard = typeof underCardSelector === "string" ? $cardWrapper.querySelector(underCardSelector) : underCardSelector;
        /** @type {HTMLElement} */
        let $card = typeof cardSelector === "string" ? $cardWrapper.querySelector(cardSelector) : cardSelector;

        Draggable.create($card, {
            type: "x",
            edgeResistance: 1,
            minimumMovement: 10,
            throwProps: true,
            onDragStart: function () {
                TweenMax.set(this.target, {clearProps: 'transform', x: 0});

                let $fakeL = $underCard.cloneNode( true );
                TweenMax.set($fakeL, {clearProps: 'transform', x: 0, className: '+=alert-fake-l'});
                TweenMax.set($fakeL, {className: '-=alert-body-card--qr-pass', display: 'block'});
                this.target.appendChild($fakeL);

                let $fakeR = $underCard.cloneNode( true );
                TweenMax.set($fakeR, {clearProps: 'transform', x: 0, className: '+=alert-fake-r'});
                TweenMax.set($fakeR, {className: '-=alert-body-card--qr-pass', display: 'block'});
                this.target.appendChild($fakeR);
            },
            onDragEnd: function () {
                let self = this;

                if (Math.abs(this.endX - this.startX) < (this.target.offsetWidth * threshold)) {
                    TweenMax.to(this.target, 0.2, {x: 0, onComplete: function() {
                        self.target.querySelector('.alert-fake-l').remove();
                        self.target.querySelector('.alert-fake-r').remove();
                        TweenMax.set(self.target, {clearProps: 'transform'});
                    }});
                } else {
                    if (this.endX > this.startX) {
                        TweenMax.to(this.target, 0.2, {x: '100%', onComplete: function() {
                            self.target.querySelector('.alert-fake-l').remove();
                            self.target.querySelector('.alert-fake-r').remove();
                            TweenMax.set(self.target, {clearProps: 'transform, translate', x: 0, display: 'none'});
                            $underCard.style.display = 'block';
                        }});
                    } else {
                        TweenMax.to(this.target, 0.2, {x: '-100%', onComplete: function() {
                            self.target.querySelector('.alert-fake-l').remove();
                            self.target.querySelector('.alert-fake-r').remove();
                            TweenMax.set(self.target, {clearProps: 'transform, translate', x: 0, display: 'none'});
                            $underCard.style.display = 'block';
                        }});
                    }

                    document.querySelector(cardSelector + '-slide-icon').classList.remove('active');
                    document.querySelector(underCardSelector + '-slide-icon').classList.add('active');
                }
            }
        });
    });
}