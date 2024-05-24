
  Мне нужно написать короткое описание функционала моего приложения для пользователей, которое я выведу под вкладкой "О приложении" на главной странице, вот фронтенд код приложения:
Главная страница: 
return (
    <Panel id={id}>
    <PanelHeader>Поиск изображений</PanelHeader>
    {fetchedUser&&(<Group><Cell before={photo_200&&<Avatar src={photo_200}/>} subtitle={city?.title}>{`${first_name} ${last_name}`}</Cell></Group>)}
    {vkUserAlbums&&<Group header={<Header mode="primary" indicator={vkUserAlbums?.length||0}>Мои альбомы</Header>}>
    {vkUserAlbums?.map((item,index)=>(<RichCell key={index} before={<Image size={96} src={item.thumb_src} alt="Обложка" borderRadius="s"/>} caption={item.size} actions={<ButtonGroup mode="horizontal" gap="s" stretched>
    <Button mode="secondary" size="l" onClick={()=>routeNavigator.push('searchCopy',{state:{item,fetchedUser,vkUserAuthToken}})}>Копии</Button>
    <Button mode="secondary" size="l" onClick={()=>routeNavigator.push('searchOriginal',{state:{item,fetchedUser,vkUserAuthToken}})}>Оригиналы</Button>
    </ButtonGroup>}>{item.title}</RichCell>))}</Group>}
    </Panel>
    );
Поиск копий изображений:
return (
    <Panel id={id}>
    <PanelHeader before={<PanelHeaderBack onClick={()=>routeNavigator.replace('/')}/>}>Найти копии</PanelHeader>
    <Group header={<Header mode="primary" indicator={!error&&`${diffImagesArray?.length??"..."} из ${photosCount}`}>{album?.title}</Header>}/>
    {error&&<Banner before={<Icon28CancelCircleFillRed/>} header="Ошибка загрузки :(" subheader={<React.Fragment>Попробуйте перезайти в альбом или перезагрузить приложение</React.Fragment>}/>}
    {!diffImagesArray&&!error&&<Div><Banner before={<Avatar size={28} style={{backgroundImage:warningGradient}}><span style={{color:'#fff'}}>!</span></Avatar>} header="Выполняется поиск копий..." subheader={<React.Fragment>• Во время поиска возможно зависание приложения<br/>• Приблизительное время для 500 фото - менее минуты<br/>• Загрузка 1000 фото - 3 мин, однако может занять больше времени<br/>• Время поиска зависит от устройства (смартфон/пк)</React.Fragment>}/></Div>}
    {diffImagesArray?.map((img,index)=>{
    let date=new Date(img.date*1000);
    let imgPreviewUrls=[];imgPreviewUrls.push(img.imgMaxResolution.url);
    const showImages=function(imgPreviewUrls){bridge.send('VKWebAppShowImages',{images:imgPreviewUrls})};
    return(
    <Group key={index}>
    <RichCell key={index} before={<VKImage size={96} src={img.imgMaxResolution.previewImg} alt="Image" borderRadius="s" onClick={()=>{showImages(imgPreviewUrls)}}/>} after={`${index+1} из ${diffImagesArray.length}`} text={`${img.imgMaxResolution.width}x${img.imgMaxResolution.height}`} actions={<ButtonGroup mode="horizontal" gap="s" stretched><Link href={`https://vk.com/album${user?.id}_${setAlbumNum(album?.id)}?z=photo${user?.id}_${img.id}%2Falbum${user?.id}_${setAlbumNum(album?.id)}%2Frev`} target="_blank">Фото в альбоме<Icon16Link/></Link></ButtonGroup>}>{date.toLocaleDateString()}</RichCell>
    {img.similarImages.map((innerImg,innerIndex)=>{
    let date2=new Date(innerImg.date*1000);imgPreviewUrls.push(innerImg.imgMaxResolution.url);
    return(
    <RichCell key={innerIndex} before={<VKImage size={96} src={innerImg.imgMaxResolution.previewImg} alt="Image" borderRadius="s" onClick={()=>{showImages(imgPreviewUrls)}}/>} text={`${innerImg.imgMaxResolution.width}x${innerImg.imgMaxResolution.height}`} caption={`Сходство: ${innerImg.similarityPercent}%`} actions={<ButtonGroup mode="horizontal" gap="s" stretched><Link href={`https://vk.com/album${user?.id}_${setAlbumNum(album?.id)}?z=photo${user?.id}_${innerImg.id}%2Falbum${user?.id}_${setAlbumNum(album?.id)}%2Frev`} target="_blank">Фото в альбоме<Icon16Link/></Link></ButtonGroup>}>{date2.toLocaleDateString()}</RichCell>
    )})}
    </Group>)})}
    {!error&&diffImagesArray?.length==0?<Div><Banner before={<Icon28CheckCircleFill/>} header="Нет копий"/></Div>:""}
    {(album?.size>1000)&&!error&&<Div><Banner before={<Avatar size={28} style={{backgroundImage:warningGradient}}><span style={{color:'#fff'}}>!</span></Avatar>} header="Поиск ограничен 1000 фото, вследствие ограничений вк"/>
    <Subhead style={{justifyContent:'center',textAlign:'center'}}>Страница {page} из {pagesCountArr?.length}</Subhead><br/>
    <Subhead style={{justifyContent:'center',textAlign:'center'}}>{offset+1} - {photosLeftOnPage}</Subhead>
    <ButtonGroup mode="horizontal" gap="none" align="center" stretched>{pagesCountArr?.map((i)=>(<Button key={i} mode="secondary" appearance="accent" size="s" stretched onClick={()=>{pages(i);}}>{i}</Button>))}</ButtonGroup></Div>}
    </Panel>
    );
Поиск оригиналов изображений:
return (
    <Panel id={id}>
    <PanelHeader before={<PanelHeaderBack onClick={()=>routeNavigator.replace('/')}/>}>SearchOriginal</PanelHeader>
    <Group header={<Header mode="primary" indicator={!error&&(photosCount<1000?photosCount:<Popover trigger={['click','hover','focus']} placement="right" role="tooltip" aria-describedby="tooltip-3" content={<Caption>Колличевство изображений ограничено 1000, вследствие ограничений вк.</Caption>}><Icon16InfoOutline/></Popover>)}>{album?.title}</Header>}>
    {error&&<Banner before={<Icon28CancelCircleFillRed/>} header="Ошибка загрузки :(" subheader={<React.Fragment>Попробуйте перезайти в альбом или перезагрузить приложение</React.Fragment>}/>}
    {!error&&<Pagination currentPage={currentPage} siblingCount={siblingCount} boundaryCount={boundaryCount} totalPages={totalPages} disabled={false} onChange={handleChange}/>}
    </Group>
    {!error&&currentItems?.map((img,index)=>{
    let imgId=img.id;
    let date=new Date(img.date*1000);
    if(searchSpinner[imgId]===undefined){setSearchSpinner((prevState)=>({...prevState,[imgId]:false}));}
    return(
    <Group key={index}>
    <RichCell key={index} before={<VKImage size={96} src={img.imgMaxResolution.previewImg} alt="Image" borderRadius="s" onClick={()=>{bridge.send('VKWebAppShowImages',{images:[img.imgMaxResolution.url]})}}/>} after={`${index+1+startIndex} из ${albumsImages.length}`} text={`${img.imgMaxResolution.width}x${img.imgMaxResolution.height}`} actions={<ButtonGroup mode="horizontal" gap="s" stretched><Link href={`https://vk.com/album${user?.id}_${setAlbumNum(album?.id)}?z=photo${user?.id}_${img.id}%2Falbum${user?.id}_${setAlbumNum(album?.id)}%2Frev`} target="_blank">Фото в альбоме<Icon16Link/></Link></ButtonGroup>}>{date.toLocaleDateString()}</RichCell>
    {!searchImgResArr[imgId]&&<Button mode="secondary" stretched before={searchSpinner[imgId]?<Spinner size="regular"/>:<Icon24SearchStarsOutline/>} onClick={()=>{fetchSearchImage(img.imgMaxResolution.url,img.id)}}>{"Поиск"}</Button>}
    {searchImgResArr[imgId]&&(searchImgResArr[imgId].results.some(item=>item.match===("best"||"additional"))?searchImgResArr[imgId].results.map((result,index)=>(<React.Fragment key={index}><Separator/><RichCell before={<VKImage size={96} src={result.thumbnail.fixedSrc} alt="Image" borderRadius="s"/>} subhead={`совпадение:${result.similarity}%`} caption={<Caption style={{whiteSpace:'normal',wordWrap:'break-word',overflowWrap:'break-word'}}>Теги:${result.thumbnail?.tags?.map(tag=>`${tag}`).join(', ')}</Caption>} actions={<ButtonGroup mode="horizontal" gap="s" stretched>{result.sources.map((source,sIndex)=>(<Button mode="primary" size="s" onClick={()=>{window.open(source.fixedHref,'_blank')}} before={(source.service!="Anime-Pictures"&&source.service!="Zerochan"&&source.service!="e-shuushuu")&&<Caption level="2" weight="3">vpn!</Caption>} after={<Icon12ArrowUpRightOutSquareOutline/>} key={sIndex}>{source.service}</Button>))}</ButtonGroup>}>{`${result.width}x${result.height}`}</RichCell></React.Fragment>)):(
    <ButtonGroup stretched>
    <Button mode="primary" size="s" onClick={()=>{window.open(searchImgResArr[imgId].otherSearchHrefs.ascii2d,'_blank')}} key="ascii2d">ascii2d</Button>
    <Button mode="primary" size="s" onClick={()=>{window.open(searchImgResArr[imgId].otherSearchHrefs.google,'_blank')}} key="google">google</Button>
    <Button mode="primary" size="s" onClick={()=>{window.open(searchImgResArr[imgId].otherSearchHrefs.saucenao,'_blank')}} key="saucenao">saucenao</Button>
    <Button mode="primary" size="s" onClick={()=>{window.open(searchImgResArr[imgId].otherSearchHrefs.tineye,'_blank')}} key="tineye">tineye</Button>
    </ButtonGroup>))}
    </Group>)})}
    {!error&&<Group><Pagination currentPage={currentPage} siblingCount={siblingCount} boundaryCount={boundaryCount} totalPages={totalPages} disabled={false} onChange={handleChange}/></Group>}
    </Panel>
    );
    