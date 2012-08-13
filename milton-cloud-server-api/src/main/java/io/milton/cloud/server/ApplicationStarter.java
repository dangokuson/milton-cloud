/*
 * Copyright 2012 McEvoy Software Ltd.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package io.milton.cloud.server;

import io.milton.cloud.server.apps.ApplicationManager;
import io.milton.cloud.server.manager.DefaultCurrentRootFolderService;
import io.milton.cloud.server.manager.MCRootContext;
import io.milton.cloud.server.web.SpliffyResourceFactory;
import io.milton.common.Service;
import io.milton.config.HttpManagerBuilder;
import io.milton.config.InitListener;
import io.milton.context.Context;
import io.milton.context.Executable2;
import io.milton.http.HttpManager;

/**
 * wired into app config, this is started and stopped from spring and takes care
 * of starting and stopping the root context, application manager and possibly other
 * stuff
 *
 * @author brad
 */
public class ApplicationStarter implements InitListener, Service{
    private final MCRootContext rootContext;

    public ApplicationStarter(MCRootContext rootContext) {
        this.rootContext = rootContext;       
    }
    
    @Override
    public void start() {
     
    }

    @Override
    public void stop() {
        rootContext.shutdown();
    }        

    @Override
    public void beforeInit(HttpManagerBuilder b) {
        
    }

    @Override
    public void afterInit(HttpManagerBuilder b) {
        
    }

    @Override
    public void afterBuild(HttpManagerBuilder b, HttpManager m) {
        rootContext.put(b);
        rootContext.put(m);
        final ApplicationManager applicationManager = rootContext.get(ApplicationManager.class);
        final SpliffyResourceFactory resourceFactory = rootContext.get(SpliffyResourceFactory.class);
        rootContext.get(DefaultCurrentRootFolderService.class).setApplicationManager(applicationManager);
        rootContext.execute(new Executable2() {

            @Override
            public void execute(Context context) {
                applicationManager.init(resourceFactory);
            }
        });   
    }
}
