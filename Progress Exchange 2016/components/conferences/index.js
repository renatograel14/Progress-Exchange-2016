'use strict';

app.conferences = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_conferences
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_conferences
(function(parent) {
    var dataProvider = app.data.demoAppBackend,
        processImage = function(img) {
            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (img.slice(0, 4) !== 'http' &&
                img.slice(0, 2) !== '//' && img.slice(0, 5) !== 'data:') {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Conference',
                dataProvider: dataProvider
            },
            group: {
                field: 'date'
            },

            change: function(e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    flattenLocationProperties(dataItem);
                }
            },
            error: function(e) {
                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'name': {
                            field: 'name',
                            defaultValue: ''
                        },
                        'presenter': {
                            field: 'presenter',
                            defaultValue: ''
                        },
                    }
                }
            },
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        conferencesModel = kendo.observable({
            dataSource: dataSource,
            itemClick: function(e) {
                app.mobileApp.navigate('#components/conferences/details.html?uid=' + e.dataItem.uid);
            },
            addClick: function() {
                app.mobileApp.navigate('#components/conferences/add.html');
            },
            detailsShow: function(e) {
                var item = e.view.params.uid,
                    dataSource = conferencesModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);
                itemModel.photoUrl = processImage(itemModel.photo);

                if (!itemModel.date) {
                    itemModel.date = String.fromCharCode(160);
                }

                conferencesModel.set('currentItem', null);
                conferencesModel.set('currentItem', itemModel);
            },
            currentItem: null
        });

    parent.set('addItemViewModel', kendo.observable({
        onShow: function(e) {
            // Reset the form data.
            this.set('addFormData', {});
        },
        onSaveClick: function(e) {
            var addFormData = this.get('addFormData'),
                dataSource = conferencesModel.get('dataSource');

            dataSource.add({});

            dataSource.one('change', function(e) {
                app.mobileApp.navigate('#:back');
            });

            dataSource.sync();
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('conferencesModel', conferencesModel);
        });
    } else {
        parent.set('conferencesModel', conferencesModel);
    }
})(app.conferences);

// START_CUSTOM_CODE_conferencesModel
// END_CUSTOM_CODE_conferencesModel